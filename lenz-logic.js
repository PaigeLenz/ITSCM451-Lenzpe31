/*
 * lenz-logic.js — Change Enablement Agent
 * Logic derived from SKILL.md Sections 1, 2, and 4.
 */

// =========================================================================
// 1. Core Functions (pure logic — no DOM access)
// =========================================================================

/**
 * classifyChange — Section 1.3 Decision Tree
 *
 * Is service currently down or critically degraded?
 *   YES → EMERGENCY
 *   NO  → Is this a pre-approved change model?
 *            YES → STANDARD
 *            NO  → NORMAL (assess risk tier next)
 *
 * @param {boolean} serviceDown  — Is the service currently down?
 * @param {boolean} preApproved  — Is this a pre-approved change model?
 * @returns {string} "Standard" | "Normal" | "Emergency"
 */
function classifyChange(serviceDown, preApproved) {
    if (serviceDown) {
        return "Emergency";
    }
    if (preApproved) {
        return "Standard";
    }
    return "Normal";
}

/**
 * assessRisk — Section 2.1 / 2.2
 *
 * Seven dimensions, each scored 1-5:
 *   Impact Scope, Complexity, Reversibility, Testing Confidence,
 *   Deployment History, Timing Sensitivity, Dependency Count
 *
 * Composite score = sum(all_dimensions) / number_of_dimensions
 *
 * Risk tiers (Section 2.2):
 *   1.0 – 2.0  → Low    (Peer review)
 *   2.1 – 3.5  → Medium (Change authority)
 *   3.6 – 5.0  → High   (Full CAB)
 *
 * @param {number[]} scores — Array of exactly 7 integers (1-5)
 * @returns {{ composite: number, tier: string }}
 */
function assessRisk(scores) {
    var sum = 0;
    for (var i = 0; i < scores.length; i++) {
        sum += scores[i];
    }
    var composite = sum / scores.length;
    // Round to one decimal place for display
    composite = Math.round(composite * 10) / 10;

    var tier;
    if (composite <= 2.0) {
        tier = "Low";
    } else if (composite <= 3.5) {
        tier = "Medium";
    } else {
        tier = "High";
    }

    return { composite: composite, tier: tier };
}

/**
 * getApprovalPath — Section 4 Approval Workflows
 *
 * Returns the ordered workflow steps for the given classification
 * and (for Normal changes) the risk tier.
 *
 * 4.1 Standard Change Flow
 * 4.2 Normal — Low Risk
 * 4.3 Normal — Medium Risk
 * 4.4 Normal — High Risk
 * 4.5 Emergency Change Flow
 *
 * @param {string} classification — "Standard" | "Normal" | "Emergency"
 * @param {string|null} riskTier  — "Low" | "Medium" | "High" (only for Normal)
 * @returns {{ title: string, steps: string[] }}
 */
function getApprovalPath(classification, riskTier) {
    if (classification === "Standard") {
        // Section 4.1
        return {
            title: "Standard Change Flow (Section 4.1)",
            steps: [
                "Requester triggers pipeline",
                "Automated pre-checks (lint, test, scan)",
                "Auto-approved (change model match verified)",
                "Deploy",
                "Automated validation",
                "Change record logged automatically"
            ]
        };
    }

    if (classification === "Emergency") {
        // Section 4.5
        return {
            title: "Emergency Change Flow (Section 4.5)",
            steps: [
                "Incident declared",
                "Emergency RFC created (minimal fields)",
                "ECAB approval (phone/chat, 2 approvers minimum)",
                "Implement immediately",
                "Validate service restored",
                "Retrospective RFC completion (within 48h)",
                "Mandatory PIR"
            ]
        };
    }

    // Normal — vary by risk tier
    if (riskTier === "Low") {
        // Section 4.2
        return {
            title: "Normal Change Flow \u2014 Low Risk (Section 4.2)",
            steps: [
                "Requester submits RFC",
                "Automated risk scoring",
                "Peer review (1 reviewer, async)",
                "Approved \u2192 Scheduled in change calendar",
                "Deploy in approved window",
                "Validation",
                "Close RFC"
            ]
        };
    }

    if (riskTier === "Medium") {
        // Section 4.3
        return {
            title: "Normal Change Flow \u2014 Medium Risk (Section 4.3)",
            steps: [
                "Requester submits RFC",
                "Automated risk scoring",
                "Technical review (architect or senior engineer)",
                "Change authority approval",
                "Scheduled in change calendar (with conflict check)",
                "Deploy with monitoring",
                "Validation + brief PIR",
                "Close RFC"
            ]
        };
    }

    // High (Section 4.4)
    return {
        title: "Normal Change Flow \u2014 High Risk (Section 4.4)",
        steps: [
            "Requester submits RFC",
            "Automated risk scoring",
            "Technical review + security review",
            "Pre-CAB: documentation completeness check",
            "CAB review (weekly cadence or ad-hoc)",
            "Senior management sign-off",
            "Scheduled with communication plan",
            "Deploy with war-room / bridge call",
            "Validation + full PIR",
            "Close RFC"
        ]
    };
}


// =========================================================================
// 2. Event Handlers & DOM Wiring
// =========================================================================

document.addEventListener("DOMContentLoaded", function () {

    // ----- DOM references -----
    var form                     = document.getElementById("change-form");
    var resultsSection           = document.getElementById("results-section");
    var classificationBadge      = document.getElementById("classification-badge");
    var classificationDescription = document.getElementById("classification-description");
    var riskAssessmentCard       = document.getElementById("risk-assessment-card");
    var riskScoreCard            = document.getElementById("risk-score-card");
    var approvalCard             = document.getElementById("approval-card");
    var approvalFlow             = document.getElementById("approval-flow");
    var mitigationCard           = document.getElementById("mitigation-card");
    var calculateRiskBtn         = document.getElementById("calculate-risk-btn");
    var resetBtn                 = document.getElementById("reset-btn");
    var compositeScoreEl         = document.getElementById("composite-score");
    var riskTierBadge            = document.getElementById("risk-tier-badge");
    var scoreBreakdown           = document.getElementById("score-breakdown");

    // Slider metadata — matches the 7 risk dimensions in Section 2.1
    var SLIDERS = [
        { id: "slider-impact",        valueId: "value-impact",        label: "Impact Scope" },
        { id: "slider-complexity",     valueId: "value-complexity",    label: "Complexity" },
        { id: "slider-reversibility",  valueId: "value-reversibility", label: "Reversibility" },
        { id: "slider-testing",        valueId: "value-testing",       label: "Testing Confidence" },
        { id: "slider-history",        valueId: "value-history",       label: "Deployment History" },
        { id: "slider-timing",         valueId: "value-timing",        label: "Timing Sensitivity" },
        { id: "slider-dependencies",   valueId: "value-dependencies",  label: "Dependency Count" }
    ];

    // ----- Slider live-update (show current value beside each slider) -----
    SLIDERS.forEach(function (s) {
        var slider  = document.getElementById(s.id);
        var display = document.getElementById(s.valueId);
        slider.addEventListener("input", function () {
            display.textContent = slider.value;
        });
    });

    // ----- Form submit → classify change -----
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var serviceDownEl = document.querySelector('input[name="service-down"]:checked');
        var preApprovedEl = document.querySelector('input[name="pre-approved"]:checked');

        if (!serviceDownEl || !preApprovedEl) {
            alert("Please answer all questions before submitting.");
            return;
        }

        var serviceDown = serviceDownEl.value === "yes";
        var preApproved = preApprovedEl.value === "yes";

        // 1) Classify using Section 1.3 decision tree
        var classification = classifyChange(serviceDown, preApproved);

        // 2) Show results section
        resultsSection.classList.remove("hidden");

        // 3) Display classification badge
        classificationBadge.textContent = classification;
        classificationBadge.className   = "badge"; // reset

        if (classification === "Standard") {
            classificationBadge.classList.add("badge-standard");
            classificationDescription.textContent =
                "Pre-authorized, low-risk, repeatable change. " +
                "No per-instance approval required \u2014 pre-approved via change model. " +
                "Lead time target: minutes to hours (automated pipeline).";

            // Hide risk sliders — not needed for Standard
            riskAssessmentCard.classList.add("hidden");
            riskScoreCard.classList.add("hidden");

            // Show approval path directly (Section 4.1)
            renderApprovalPath(classification, null);
            mitigationCard.classList.remove("hidden");

        } else if (classification === "Emergency") {
            classificationBadge.classList.add("badge-emergency");
            classificationDescription.textContent =
                "Must be implemented immediately to restore service or prevent imminent critical impact. " +
                "Expedited ECAB approval required. Full documentation within 48 hours. " +
                "A corresponding incident or problem record is mandatory.";

            // Hide risk sliders — not needed for Emergency
            riskAssessmentCard.classList.add("hidden");
            riskScoreCard.classList.add("hidden");

            // Show approval path directly (Section 4.5)
            renderApprovalPath(classification, null);
            mitigationCard.classList.remove("hidden");

        } else {
            // Normal — show risk assessment sliders
            classificationBadge.classList.add("badge-normal");
            classificationDescription.textContent =
                "This change requires assessment, authorization, and scheduling. " +
                "Use the risk sliders below to evaluate the 7 dimensions, then click " +
                "\"Calculate Risk Score\" to determine the risk tier and approval path.";

            riskAssessmentCard.classList.remove("hidden");
            riskScoreCard.classList.add("hidden");

            // Placeholder in approval area until risk is scored
            approvalFlow.innerHTML =
                '<p style="color:var(--text-muted, #5a6a7e);font-style:italic;">' +
                "Complete the risk assessment above to see the recommended approval path." +
                "</p>";
            mitigationCard.classList.add("hidden");
        }

        resultsSection.scrollIntoView({ behavior: "smooth" });
    });

    // ----- Calculate Risk button → assess risk, show score + approval path -----
    calculateRiskBtn.addEventListener("click", function () {
        // Gather the 7 slider values
        var scores = [];
        var labels = [];

        SLIDERS.forEach(function (s) {
            var val = parseInt(document.getElementById(s.id).value, 10);
            scores.push(val);
            labels.push(s.label);
        });

        // Run risk assessment (Section 2.2)
        var result = assessRisk(scores);

        // Display composite score
        compositeScoreEl.textContent = result.composite.toFixed(1);

        // Display tier badge
        riskTierBadge.textContent = result.tier + " Risk";
        riskTierBadge.className   = "badge"; // reset
        if (result.tier === "Low") {
            riskTierBadge.classList.add("badge-low");
        } else if (result.tier === "Medium") {
            riskTierBadge.classList.add("badge-medium");
        } else {
            riskTierBadge.classList.add("badge-high");
        }

        // Show per-dimension breakdown
        scoreBreakdown.innerHTML = scores
            .map(function (val, i) {
                return "<span>" + labels[i] + ": " + val + "</span>";
            })
            .join("");

        riskScoreCard.classList.remove("hidden");

        // Show the matching approval path (Section 4.2 / 4.3 / 4.4)
        renderApprovalPath("Normal", result.tier);

        // Show mitigation checklist (Section 2.3)
        mitigationCard.classList.remove("hidden");

        riskScoreCard.scrollIntoView({ behavior: "smooth" });
    });

    // ----- Reset button → clear everything -----
    resetBtn.addEventListener("click", function () {
        form.reset();

        resultsSection.classList.add("hidden");
        riskAssessmentCard.classList.add("hidden");
        riskScoreCard.classList.add("hidden");

        // Reset sliders to midpoint (3)
        SLIDERS.forEach(function (s) {
            document.getElementById(s.id).value = 3;
            document.getElementById(s.valueId).textContent = "3";
        });

        // Uncheck mitigation checklist
        var checkboxes = document.querySelectorAll('#mitigation-checklist input[type="checkbox"]');
        checkboxes.forEach(function (cb) {
            cb.checked = false;
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // =========================================================================
    // 3. Render Helpers
    // =========================================================================

    /**
     * renderApprovalPath — draws the approval steps into #approval-flow
     */
    function renderApprovalPath(classification, riskTier) {
        var path = getApprovalPath(classification, riskTier);

        var html = '<p class="approval-title"><strong>' + path.title + "</strong></p>";
        html += path.steps
            .map(function (step, i) {
                return '<div class="approval-step">' + (i + 1) + ". " + step + "</div>";
            })
            .join("");

        approvalFlow.innerHTML = html;
    }
});
