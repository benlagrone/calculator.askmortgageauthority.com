function toggleCalculatorDropdownOrRadio(t) {
    var e = t.target,
        a = e.value,
        r = e.name,
        n = "input[name=" + r + "][type=radio]",
        o = document.querySelectorAll(n),
        i = ["state", "purchaseprice", "monthlydebt"],
        s = ["zipcode", "annualincome", "creditscore"],
        l = ["cash-outamount", "state", "estimatedvalue", "annualincome"],
        u = ["propertyusage", "zipcode", "loanamount", "monthlydebt"],
        c = ["state", "estimatedvalue", "annualincome"],
        d = ["zipcode", "loanamount", "monthlydebt"],
        m = function (t) {
            var e = document.createElement("div");
            e.classList.add("row"), e.classList.add("spacerDiv"), t.insertAdjacentElement("afterend", e)
        },
        h = 0;
    for (h = 0; h < o.length; h++) {
        var g = o[h].attributes;
        g["aria-checked"].value = g.value.value === a
    }
    for (var p = MortgageCalculatorUtils.closest(e, "mortgage-calculators-widget-form"), f = p.querySelectorAll("input[data-parent-options]"), v = 0; v < f.length; ++v)
        if (f[v].dataset.hasOwnProperty("parentOptions")) {
            var y = MortgageCalculatorUtils.closest(f[v], "mortgage-calculators-widget-form-group"),
                b = f[v].dataset.parentOptions.split(","),
                P = f[v].dataset.parent.replace(/ /g, "").toLowerCase();
            b.indexOf(a) > -1 && P === r ? y.classList.remove("is-hidden") : P === r && y.classList.add("is-hidden")
        }
    if ("loanpurpose" === r) {
        document.querySelectorAll(".spacerDiv").forEach(function (t) {
            t.remove()
        });
        for (var w = 0; w < p.length; w++) {
            if ("annualincome" === p[w].name) var T = w;
            if ("downpaymentamount" === p[w].name) var R = w;
            if ("monthlydebt" === p[w].name) var M = w;
            if (T && R && M) break
        }
        "Purchase" === a ? p.insertBefore(p[T].parentNode.parentNode, p[R].parentNode.parentNode) : p.insertBefore(p[T].parentNode.parentNode, p[M].parentNode.parentNode);
        for (var C = 0; C < p.length; C++) {
            var A = "select" === p[C].localName ? MortgageCalculatorUtils.closest(p[C], "mortgage-calculators-widget-select-group") : MortgageCalculatorUtils.closest(p[C], "mortgage-calculators-widget-form-group");
            if (A) switch (a) {
                case "Purchase":
                    i.includes(p[C].name) ? (A.classList.remove("half-width-field-right"), A.classList.add("half-width-field")) : s.includes(p[C].name) ? (A.classList.remove("half-width-field"), A.classList.add("half-width-field-right"), m(A)) : (A.classList.remove("half-width-field"), A.classList.remove("half-width-field-right"));
                    break;
                case "Cash-Out Refinance":
                    l.includes(p[C].name) ? (A.classList.remove("half-width-field-right"), A.classList.add("half-width-field")) : u.includes(p[C].name) ? (A.classList.remove("half-width-field"), A.classList.add("half-width-field-right"), m(A)) : (A.classList.remove("half-width-field"), A.classList.remove("half-width-field-right"));
                    break;
                case "No Cash-Out Refinance":
                    c.includes(p[C].name) ? (A.classList.remove("half-width-field-right"), A.classList.add("half-width-field")) : d.includes(p[C].name) ? (A.classList.remove("half-width-field"), A.classList.add("half-width-field-right"), m(A)) : (A.classList.remove("half-width-field"), A.classList.remove("half-width-field-right"))
            }
        }
    }
}

function onInputKeyDown(t, e) {
    if (!([8, 9, 37, 38, 39, 40, 46].indexOf(t.keyCode) > -1)) {
        if (RatesCalculator.utils && RatesCalculator.utils.getNumberOfWholeDigits(t.target.value) > t.target.dataset.maxwholenumbers) return void t.preventDefault();
        t.target.dataset.previousValue = t.target.value;
        var a = "true" === t.target.dataset.allownegative;
        switch (e) {
            case "number":
                MortgageCalculatorUtils.allowNumbersOnly(t, 0, 100, a);
                break;
            case "amount":
                MortgageCalculatorUtils.allowNumbersOnly(t, 2, 100, a);
                break;
            case "percentage":
                MortgageCalculatorUtils.allowNumbersOnly(t, 3, 100, a);
                break;
            case "year":
                MortgageCalculatorUtils.allowNumbersOnly(t, 0, 2, a);
                break;
            case "month":
                MortgageCalculatorUtils.allowNumbersOnly(t, 0, 3, a);
                break;
            case "zip":
                MortgageCalculatorUtils.allowNumbersOnly(t, 0, 5, !1)
        }
    }
}

function onInputKeyUp(t, e) {
    if (!([9, 16, 37, 38, 39, 40].indexOf(t.keyCode) > -1)) {
        var a = "true" === t.target.dataset.allownegative;
        switch (e) {
            case "amount":
                var r = t.target.dataset.maxwholenumbers;
                r && RatesCalculator.utils && RatesCalculator.utils.getNumberOfWholeDigits(t.target.value) > r && (t.target.value = t.target.dataset.previousValue), t.target.value = MortgageCalculatorUtils.formatNumbers(t.target.value, 2, !0, a);
                break;
            case "percentage":
                t.target.value = MortgageCalculatorUtils.formatNumbers(t.target.value, 3, !1, a)
        }
    }
}

function onCalculatorSubmit(t) {
    t.preventDefault();
    var e = t.target,
        a = !(!t.detail || !t.detail.isAutoRun) && t.detail.isAutoRun;
    MortgageCalculator.setFormId(e), MortgageCalculator.removeOldErrors();
    var r = MortgageCalculator.getFormData(e);
    if ("Rates" === r.type.value && a && (!staticGlobalsJSON || !staticGlobalsJSON.IS_CMS_SITE_AUTO_RATES_CALC_ON)) return void console.log("Warning:  Auto Rates Widget execution cancelled due to global feature flag setting.");
    return MortgageCalculator.validateFormData(r, a), MortgageCalculator.hasError ? (MortgageCalculator.clearResults(), MortgageCalculatorTables.clearTables(!0), void RatesCalculator.resetRates()) : (MortgageCalculator.calculateForm(r), MortgageCalculator.scrollToResults(), !1)
}

function onMortgageCalculatorButtonClick(t, e, a) {
    switch (t.preventDefault(), e) {
        case "add-debt":
            MortgageCalculatorDebtUtils.cloneDebtSection(a);
            break;
        case "remove-debt":
            MortgageCalculatorDebtUtils.removeDebtSection(t, a)
    }
}

function downPaymentOnBlur(t, e) {
    var a, r = MortgageCalculatorUtils.closest(t.target, "mortgage-calculators-widget-form"),
        n = r.id.substring(r.id.indexOf("form-js-") + 8),
        o = document.getElementById("purchaseprice-" + n),
        i = document.getElementById("downpaymentamount-" + n),
        s = document.getElementById("downpaymentpercentage-" + n);
    "amount" === e && o.value && (a = i.value.replace(/,/g, "") / o.value.replace(/,/g, ""), s.value = (100 * a).toFixed(3)), "percentage" === e && o.value && (a = o.value.replace(/,/g, "") * s.value.replace(/,/g, "") / 100, i.value = MortgageCalculatorUtils.formatNumbers(a.toString(), 2, !0, !1))
}

var EPPS = "epps",
    OB = "ob",
    EPC = "epcPpe",
    RatesFieldMapping, staticGlobalsJSON, runtimeRelativeFileResolver = function (t, e) {
        return e = e || "", window.___ems_build ? "js/" + t : "../../js/" + e + t
    };
window.Elli || function () {
    var t = document.createElement("script"),
        e = "",
        a = window.___ems_build ? "utils.js" : "utils.min.js";
    if (window.location.toString().indexOf(".int.mymortgage-app.net") > -1 && window.location.search.indexOf("runtimefolder") > -1) {
        var r = encodeURI(window.location.search).replace("?", "").split("&")[0].split("=")[1];
        e = r ? r + "/" : ""
    }
    t.src = runtimeRelativeFileResolver(a, e), t.type = "text/javascript";
    var n = (window.___ems_build ? "head " : "body ") + ' script[src*="vendors/jquery"]:first';
    $(n).after(t)
}(), function (t) {
    if (!RatesFieldMapping) {
        var e = runtimeRelativeFileResolver("ratesFieldMapping.json");
        t.getJSON(e).done(function (t) {
            RatesFieldMapping = t
        })
    }
}(jQuery);

var MortgageCalculatorUtils = {
    allowNumbersOnly: function (t, e, a, r) {
        var n = t.target.value,
            o = n.split("."),
            i = t.keyCode >= 48 && t.keyCode <= 57 || t.keyCode >= 96 && t.keyCode <= 105,
            s = 110 === t.keyCode || 190 === t.keyCode,
            l = 109 === t.keyCode || 189 === t.keyCode;
        return t.shiftKey ? t.preventDefault() : (n.length !== a || this.isTextSelected(t)) && (0 !== e || i || r && l) && (s || i || r && l) ? void (e > 0 && o.length > 1 && o[1].length === e && t.preventDefault()) : t.preventDefault()
    },
    isEPCPPE: function () {
        var t = RatesCalculator.ratesApiSettings.productPricingProvider,
            e = RatesCalculator.ratesApiSettings.pricingEngineProviders;
        return !!(t === EPC || e.PPE && e.PPE[t])
    },
    formatNumbers: function (t, e, a, r) {
        var n = r && 0 === t.indexOf("-") ? "-" : "";
        t = t.replace(/[^0-9.]+/g, ""), t = t.split("."), t.length > 1 && t.splice(t.length - 1, 0, "."), t = t.join("");
        var o = t.split(".");
        return a && (o[0] = o[0].replace(/\d(?=(?:\d{3})+$)/g, "$&,")), o.length > 1 && (o[1] = o[1].substring(0, e)), n + o.join(".")
    },
    isTextSelected: function (t) {
        return t.target.selectionStart !== t.target.selectionEnd
    },
    closest: function (t, e) {
        return t === document ? null : t && (t.classList.contains(e) ? t : this.closest(t.parentNode, e))
    },
    isElementVisible: function (t) {
        var e = t.getBoundingClientRect(),
            a = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(e.bottom < 0 || e.top - a >= 0)
    },
    convertCamelCase: function (t) {
        var e = "";
        return e = t.replace(/([a-z])([A-Z])/g, "$1 $2"), e = e.replace(/([0-9])([A-Z])/g, "$1 $2"), e = e.replace(/([a-z])([0-9])/g, "$1 $2"), e = e.replace(/([a-z])([0-9])/g, "$1 $2"), e = e.replace(/([a-z])(&)/g, "$1 $2"), e = e.replace(/(&)([A-Z])/g, "$1 $2")
    }
};

var MortgageCalculatorDebtUtils = {
    cloneCount: {},
    removeDebtSection: function (t, e) {
        var a = t.target.parentElement;
        a && this.cloneCount[e] > 0 && a.remove()
    },
    cloneDebtSection: function (t) {
        void 0 === this.cloneCount[t] && (this.cloneCount[t] = 0);
        var e = document.getElementById("add-debt-container-" + t + "-js"),
            a = e.cloneNode(!0);
        a.classList.add("is-clone"), a.id += "-" + (this.cloneCount[t] + 1), this.cleanClonedFields(a, t)
    },
    cleanClonedFields: function (t, e) {
        for (var a = t.querySelectorAll("input, select"), r = t.querySelectorAll(".mortgage-calculators-error"), n = 0; n < r.length; n++) r[n].remove();
        for (var o = "-" + (this.cloneCount[e] + 1), i = 0; i < a.length; ++i) "SELECT" === a[i].tagName && (a[i].value = "Mortgage"), "INPUT" === a[i].tagName && (a[i].value = ""), a[i].name += o, a[i].id = a[i].id.replace("-", o + "-"), a[i].classList.remove("is-calculator-error");
        this.insertClonedElement(t, e), this.cloneCount[e]++
    },
    insertClonedElement: function (t, e) {
        var a = document.getElementById("mortgage-calculators-widget-form-js-" + e),
            r = a.getElementsByClassName("mortgage-calculators-add-debt-container");
        r[r.length - 1].insertAdjacentElement("afterend", t)
    }
};

var MortgageCalculatorTables = {
    headers: [],
    data: {},
    id: null,
    isGrandTotal: !1,
    tablesHTML: "",
    init: function (t, e, a, r) {
        this.headers = t, this.data = e, this.id = a, this.isGrandTotal = r, this.buildTables(), this.setTables()
    },
    clearTables: function (t) {
        if (this.id) {
            var e = ["mortgage-calculators-widget-tables-js-"];
            t && e.push("mortgage-calculators-widget-tables-grandtotal-js-"), this.clearTablesHelper(e), document.getElementById("mortgage-calculators-widget-tables-href-js-" + this.id).classList.remove("is-active")
        }
    },
    clearTablesHelper: function (t) {
        for (var e, a = 0; a < t.length; a++) e = document.getElementById(t[a] + this.id), e.innerHTML = ""
    },
    setTables: function () {
        var t, e = this.isGrandTotal ? "mortgage-calculators-widget-tables-grandtotal-js-" : "mortgage-calculators-widget-tables-js-";
        e += this.id, t = document.getElementById(e), t.innerHTML = this.tablesHTML, document.getElementById("mortgage-calculators-widget-tables-href-js-" + this.id).classList.add("is-active")
    },
    buildTables: function () {
        for (var t = "", e = 0; e < this.data.length; e++) "Grand Total" === this.data[e].header ? t += this.buildGrandTotalTable(this.data[e]) : t += this.buildTable(this.data[e]);
        this.tablesHTML = t
    },
    buildGrandTotalTable: function (t) {
        var e = t.hasOwnProperty("rowHeaders") ? t.rowHeaders : this.headers,
            a = '<table class="mortgage-calculators-table is-grandtotal">';
        return a += this.buildTablePreHeadRow(e, t), a += this.buildTableBody(e, t.totals, !0), a += "</table>"
    },
    buildTable: function (t) {
        var e = t.hasOwnProperty("rowHeaders") ? t.rowHeaders : this.headers,
            a = '<table class="mortgage-calculators-table">';
        return a += this.buildTableHead(e, t), a += t.hasOwnProperty("rows") ? this.buildTableBody(e, t.rows) : "", a += t.hasOwnProperty("totals") ? this.buildTableFooter(e, t.totals) : "", a += "</table>"
    },
    buildTableHead: function (t, e) {
        var a = this.buildTablePreHeadRow(t, e);
        return a += "<thead>", a += this.buildTableHeadRow(t), a += "</thead>"
    },
    buildTablePreHeadRow: function (t, e) {
        var a = '<caption class="mortgage-calculators-table-row-header theme-title-text">';
        return a += e.header, a += "</caption>"
    },
    buildTableHeadRow: function (t) {
        for (var e = "<tr>", a = 0; a < t.length; a++) e += this.buildTableHeader(t[a]);
        return e += "</tr>"
    },
    buildVerticalRows: function (t, e) {
        for (var a = "", r = 0; r < t.length; r++) a += this.buildVerticalRow(t[r], e);
        return a
    },
    buildVerticalRow: function (t, e) {
        var a = "<tr>";
        return a += this.buildTableHeader(t), a += this.buildTableData(e[t]), a += "</tr>"
    },
    buildTableBody: function (t, e, a) {
        var r = "<tbody>";
        if (a) r += this.buildVerticalRows(t, e);
        else
            for (var n = 0; n < e.length; n++) r += this.buildTableRow(t, e[n]);
        return r += "</tbody>"
    },
    buildTableFooter: function (t, e) {
        var a = "<tfoot>";
        return a += this.buildTableRow(t, e), a += "</tfoot>"
    },
    buildTableRow: function (t, e) {
        for (var a = "<tr>", r = 0; r < t.length; r++) a += this.buildTableData(e[t[r]]);
        return a += "</tr>"
    },
    buildTableData: function (t) {
        return '<td class="theme-body-text">' + t + "</td>"
    },
    buildTableHeader: function (t) {
        return '<th class="theme-body-text" scope="col">' + MortgageCalculatorUtils.convertCamelCase(t) + "</th>"
    }
};

var MortgageCalculator = {
    hasError: !1,
    formId: null,
    REQUIRED_MSG: "*Required",
    setFormId: function (t) {
        this.formId = t.id.substring(t.id.indexOf("js-") + 3)
    },
    getFieldIdentifier: function (t) {
        return t.replace(/( |'|\?|\(|\)|\/|&)/g, "").toLowerCase()
    },
    getFormData: function (t) {
        for (var e = t.querySelectorAll("input, select"), a = {}, r = 0; r < e.length; ++r) {
            var n = e[r];
            n.classList.remove("is-calculator-error");
            var o = JSON.parse(JSON.stringify(n.dataset)),
                i = n.name,
                s = n.value,
                l = n.type || "",
                u = MortgageCalculatorUtils.closest(n, "mortgage-calculators-widget-form-group");
            i && "radio" !== l ? a[i] = {
                name: i,
                isHidden: "text" === l && u.classList.contains("is-hidden"),
                value: s.replace(/,/g, ""),
                properties: o,
                text: "select-one" === l && n.selectedIndex > -1 ? n.options[n.selectedIndex].label : ""
            } : n.checked && (a[i] = {
                name: i,
                value: s,
                properties: o,
                isHidden: !1
            })
        }
        return a
    },
    validateFormData: function (t, e) {
        this.hasError = !1, this.isAutoRun = e;
        var a = this.REQUIRED_MSG;
        for (var r in t)
            if (t.hasOwnProperty(r)) {
                var n = "false" !== t[r].properties.allowzerovalues;
                t[r].value && (n || parseFloat(t[r].value)) || t[r].isHidden ? t[r].isHidden || this.checkValidations(t[r], t) : (this.addErrorToInput(r, a), this.hasError = !0)
            }
    },
    checkValidations: function (t, e) {
        this.checkMinAndMax(t), this.checkDateFormat(t), this.checkLessThanOtherField(t, e), this.checkLessThanOrEqualToOtherField(t, e), this.checkCustomValidations(t, e), this.checkRegExValidations(t)
    },
    checkMinAndMax: function (t) {
        var e = t.properties,
            a = parseFloat(t.value),
            r = e.hasOwnProperty("min"),
            n = e.hasOwnProperty("max"),
            o = "";
        r && n ? (a < e.min || a > e.max) && (o = "Value must be between " + MortgageCalculatorUtils.formatNumbers(e.min, 5, !0, !0) + " and " + MortgageCalculatorUtils.formatNumbers(e.max, 5, !0, !0), this.addErrorToInput(t.name, o), this.hasError = !0) : n ? a > e.max && (o = "Value must be less than " + MortgageCalculatorUtils.formatNumbers(e.max, 5, !0, !0), this.addErrorToInput(t.name, o), this.hasError = !0) : r && a < e.min && (o = "Value must be greater than " + MortgageCalculatorUtils.formatNumbers(e.min, 5, !0, !0), this.addErrorToInput(t.name, o), this.hasError = !0)
    },
    checkDateFormat: function (t) {
        var e = t.properties,
            a = t.value,
            r = e.hasOwnProperty("dateformat"),
            n = "Please enter a valid date";
        if (r && "mm/yyyy" === e.dateformat) {
            var o = a.split("/");
            if (2 !== o.length) this.addErrorToInput(t.name, n), this.hasError = !0;
            else {
                var i = parseInt(o[0], 10),
                    s = parseInt(o[1], 10);
                (!i || !s || i < 1 || i > 12 || 4 !== o[1].length) && (this.addErrorToInput(t.name, n), this.hasError = !0)
            }
        }
    },
    checkLessThanOtherField: function (t, e) {
        var a = t.properties,
            r = parseFloat(t.value);
        a.hasOwnProperty("lessthan") && (r >= e[this.getFieldIdentifier(a.lessthan)].value && (this.addErrorToInput(t.name, "Value must be less than " + a.lessthan), this.hasError = !0))
    },
    checkLessThanOrEqualToOtherField: function (t, e) {
        var a = t.properties,
            r = parseFloat(t.value);
        a.hasOwnProperty("lessthanorequal") && (r > e[this.getFieldIdentifier(a.lessthanorequal)].value && (this.addErrorToInput(t.name, "Value must be less than or equal to " + a.lessthanorequal), this.hasError = !0))
    },
    checkRegExValidations: function (t) {
        var e = t.properties,
            a = t.value;
        e.hasOwnProperty("regex") && (new RegExp(e.regex).test(a) || (this.addErrorToInput(t.name, e.regexerrormessage), this.hasError = !0))
    },
    checkCustomValidations: function (t, e) {
        var a = t.properties;
        a.hasOwnProperty("custom") && ("firstInterestVsMonthlyPayment" === a.custom && this.checkFirstInterestVsMonthlyPayment(t, e), "numberOfUnitsValidation" === a.custom && this.numberOfUnitsValidation(t, e))
    },
    numberOfUnitsValidation: function (t, e) {
        var a = parseInt(t.value),
            r = e.propertytype;
        RatesCalculator.ratesApiSettings.productPricingProvider === EPPS && "Multi-UnitProperty" === r.value || MortgageCalculatorUtils.isEPCPPE() && "Detached-Multi" === r.value ? (a < 2 || a > 4) && (this.addErrorToInput(t.name, "Value must be 2, 3, or 4 units for this property type."), this.hasError = !0) : 1 !== a && (this.addErrorToInput(t.name, "Value must be equal to 1 for this property type."), this.hasError = !0)
    },
    checkFirstInterestVsMonthlyPayment: function (t, e) {
        var a = t.name.indexOf("-"),
            r = a > -1 ? t.name.substring(a) : "",
            n = parseFloat(t.value),
            o = e["interestrate" + r].value / 100 / 12,
            i = e["balance" + r].value,
            s = i * o;
        s >= n && (this.addErrorToInput(t.name, "Value must be greater than " + s.toFixed(2)), this.hasError = !0)
    },
    addErrorToInput: function (t, e) {
        if (!this.isAutoRun || e !== this.REQUIRED_MSG) {
            var a = document.getElementById(t + "-" + this.formId),
                r = this.createErrorElement(e);
            a && (a.classList.add("is-calculator-error"), a.parentElement.appendChild(r))
        }
    },
    createErrorElement: function (t) {
        var e = document.createElement("div");
        return e.innerHTML = t, e.classList.add("mortgage-calculators-error"), e
    },
    removeOldErrors: function () {
        for (var t = document.getElementById("mortgage-calculators-widget-form-js-" + this.formId), e = t.getElementsByClassName("mortgage-calculators-error"); e.length > 0;) e[0].parentNode.removeChild(e[0])
    },
    calculateForm: function (t) {
        switch (t.type.value) {
            case "Early Payoff":
                this.calculateEarlyPayoff(t);
                break;
            case "Payment / Amortization":
                this.calculatePaymentAmortization(t);
                break;
            case "Refinance Break-Even Point":
                this.calculateRefinanceBreakEvenPoint(t);
                break;
            case "Prepayment Savings":
                this.calculatePrepaymentSavings(t);
                break;
            case "Annual Percentage Rate (APR)":
                this.calculateAPR(t);
                break;
            case "Rent Vs. Own":
                this.calculateRentVsOwn(t);
                break;
            case "Debt Consolidation":
                this.calculateDebtConsolidation(t);
                break;
            case "Tax Savings":
                this.calculateTaxSavings(t);
                break;
            case "Rates":
                this.calculateRates(t)
        }
    },
    clearResults: function () {
        for (var t = document.getElementById("mortgage-calculators-widget-results-js-" + this.formId), e = t.getElementsByClassName("mortgage-calculators-widget-result"), a = 0; a < e.length; a++) "spinner" !== e[a].dataset.type && ("undefined" !== e[a].dataset.placeholder && (e[a].innerHTML = e[a].dataset.placeholder))
    },
    setResults: function (t) {
        for (var e = document.getElementById("mortgage-calculators-widget-results-js-" + this.formId), a = e.getElementsByClassName("mortgage-calculators-widget-result"), r = 0; r < a.length; r++) {
            var n = t[a[r].id],
                o = a[r].parentElement;
            if (n) {
                o.classList.remove("is-hidden");
                var i = a[r].dataset.type;
                if ("spinner" === i) continue;
                if ("object" == typeof n && n.hasOwnProperty("value") && n.hasOwnProperty("label")) {
                    o.getElementsByClassName("mortgage-calculators-widget-subtitle")[0].innerHTML = n.label, n = n.value
                }
                "noresults" === i && (o.getElementsByClassName("mortgage-calculators-widget-subtitle")[0].innerHTML = ""), a[r].innerHTML = this.getResultHtml(i, n)
            } else o.classList.add("is-hidden")
        }
    },
    getResultHtml: function (t, e) {
        var a;
        switch (t) {
            case "amount":
                return e = Math.round(100 * e) / 100, a = "$" + MortgageCalculatorUtils.formatNumbers(e.toFixed(2), 2, !0, !1), e < 0 ? "(" + a + ")" : a;
            case "percentage":
                return e = Math.round(1e3 * e) / 1e3, a = MortgageCalculatorUtils.formatNumbers(e.toFixed(3), 3, !0, !0) + "%";
            case "text":
                return e.toString();
            case "error":
                return '<span style="color: #e34256">' + e + "</span>";
            case "noresults":
                return '<div class="rates-error-header">' + e[0] + '</div><div class="rates-error-body">' + e[1] + "</div>";
            case "summary":
                var r = 0,
                    n = "",
                    o = "",
                    i = Object.keys(e).length - 1,
                    s = "",
                    l = "mortgage-calculators-summary",
                    u = "",
                    c = "",
                    d = "",
                    m = "";
                return document.getElementById("in-editor-js") ? (s = l + " summary-grid-container-with-builder", d = l + " summary-grid-item-with-builder") : (s = l + " summary-grid-container", d = l + " summary-grid-item"), Object.keys(e).forEach(function (t) {
                    a = isNaN(e[t]) ? e[t] : "$" + MortgageCalculatorUtils.formatNumbers(parseFloat(e[t], 10).toFixed(2), 2, !0, !1), m = r <= 0 ? l + " summary-first-item" : r >= i ? l + " summary-last-item" : l + " summary-item", n = '<span class="mortgage-calculators-summary summary-header">' + t + "</span>", o = '<span class="mortgage-calculators-summary summary-value">' + a + "</span>", c = '<span class="' + m + '">' + n + o + "</span>", u += c, r++
                }), '<div class="' + s + '"><div class="' + d + '">' + u + "</div></div>";
            default:
                return ""
        }
    },
    scrollToResults: function () {
        var t = document.getElementById("mortgage-calculators-widget-results-title-js-" + this.formId);
        if (!MortgageCalculatorUtils.isElementVisible(t)) {
            var e, a;
            $("#in-editor-js").length > 0 ? (e = $(".site-builder-preview-container"), a = e.scrollTop() + $(t).offset().top - e.offset().top - 20) : (e = $("body"), a = $(t).offset().top - 20), e.animate({
                scrollTop: a
            })
        }
    },
    calculateEarlyPayoff: function (t) {
        var e = 12 * t.originalloanterm.value,
            a = 12 * t.requestedyearstopayoff.value,
            r = t.originalinterestrate.value / 100 / 12,
            n = t.monthsalreadypaid.value,
            o = t.originalloanamount.value,
            i = this.getMonthlyPayment(r, e, o),
            s = o - this.getPrincipalAndInterestPaid(r, o, i, 0, n).principalPaid,
            l = this.getMonthlyPayment(r, a, s),
            u = l - i,
            c = {
                currentmonthlypayment: i,
                earlypayoffmonthlypayment: l,
                additionalmonthlypayment: u
            };
        this.setResults(c)
    },
    calculatePaymentAmortization: function (t) {
        var e, a, r = 12 * t.loanterm.value,
            n = t.interestrate.value / 100 / 12,
            o = t.loanamount.value,
            i = t.showamortizationtable.value,
            s = t.beginningmonthyear ? this.getDateFromMonthAndYear(t.beginningmonthyear.value) : this.getDateForBeginningOfCurrentMonth(),
            l = this.getMonthlyPayment(n, r, o),
            u = {};
        if ("Fixed Rate" === t.loantype.value) "No" !== i && (e = {
            monthlyRate: n,
            loanAmount: o,
            termMonths: r,
            monthlyPayment: l,
            beginningDate: s
        }, a = this.getAmortizationSchedule(e)), u.monthlypayment = l, u.initialmonthlypayment = "", u.maximummonthlypayment = "";
        else {
            e = {
                monthlyRate: n,
                loanAmount: o,
                termMonths: r,
                monthlyPayment: l,
                maxPeriodicMonthlyRateIncrease: t.maxperiodicrateincrease.value / 100 / 12,
                maxLifetimeMonthlyRateIncrease: t.maxlifetimerateincrease.value / 100 / 12,
                monthsWithInitialRate: t.presentratechangesafter.value,
                monthsBetweenRateChanges: t.ratecanchangeevery.value,
                beginningDate: s
            }, a = this.getAmortizationSchedule(e);
            var c = Math.max.apply(Math, a.map(function (t) {
                return t.payment
            }));
            u.initialmonthlypayment = l, u.maximummonthlypayment = c, u.monthlypayment = ""
        }
        if ("No" !== i && a && (u.amortizationTable = this.getAmortizationTableFromSchedule(a, i)), this.setResults(u), u.hasOwnProperty("amortizationTable")) {
            var d = ["timePeriod", "payment", "principal", "interest", "balance"];
            MortgageCalculatorTables.init(d, u.amortizationTable.slice(0, 1), this.formId, !0), MortgageCalculatorTables.init(d, u.amortizationTable.slice(1), this.formId, !1)
        } else MortgageCalculatorTables.clearTables(!0)
    },
    calculateRefinanceBreakEvenPoint: function (t) {
        var e = t.currentmonthlypayment.value,
            a = t.newloanamount.value,
            r = t.newinterestrate.value / 100 / 12,
            n = 12 * t.loanterm.value,
            o = t.closingcosts.value,
            i = this.getMonthlyPayment(r, n, a),
            s = e - i,
            l = "Never";
        s > 0 && (l = Math.ceil(o / s));
        var u = {
            newmonthlypayment: i,
            monthlysavings: s,
            numberofmonthstobreakeven: l
        };
        this.setResults(u)
    },
    calculatePrepaymentSavings: function (t) {
        var e, a;
        void 0 === t.additionalpaymentamount ? (e = parseFloat(t["additionalpaymentamount-input"].value), a = t["additionalpaymentamount-dropdown"].value) : (e = parseFloat(t.additionalpaymentamount.value), a = t.prepaymentfrequency.value);
        var r, n, o = t.makefirstadditionalpayment.value,
            i = t.presentloanbalance.value,
            s = t.interestrate.value / 100,
            l = t.remainingloantermyear.value,
            u = t.remainingloantermmonth.value,
            c = t.showamortizationtable.value,
            d = 12 * l + parseInt(u, 10),
            m = s / 12,
            h = this.getMonthlyPayment(m, d, i),
            g = this.getDateForBeginningOfCurrentMonth(),
            p = {
                monthlyRate: m,
                loanAmount: i,
                termMonths: d,
                monthlyPayment: h,
                firstAdditionalPayment: o,
                additionalPaymentAmountFrequency: a,
                beginningDate: g
            },
            f = {};
        "Fixed Rate" !== t.loantype.value && (p.maxPeriodicMonthlyRateIncrease = t.maxperiodicrateincrease.value / 100 / 12, p.maxLifetimeMonthlyRateIncrease = t.maxlifetimerateincrease.value / 100 / 12, p.monthsWithInitialRate = t.presentratechangesafter.value, p.monthsBetweenRateChanges = t.ratecanchangeevery.value), r = this.getAmortizationSchedule(p), p.additionalPaymentAmount = e, n = this.getAmortizationSchedule(p);
        var v = this.monthsToYearsAndMonthsString(d - n.length),
            y = this.sum(r, "interest") - this.sum(n, "interest");
        if (f.loantermreduction = v, f.interestsavings = y, this.setResults(f), "No" !== c && (f.amortizationTable = this.getAmortizationTableFromSchedule(n, c)), f.hasOwnProperty("amortizationTable")) {
            var b = ["timePeriod", "payment", "extraPayment", "principal", "interest", "balance"];
            MortgageCalculatorTables.init(b, f.amortizationTable.slice(0, 1), this.formId, !0), MortgageCalculatorTables.init(b, f.amortizationTable.slice(1), this.formId, !1)
        } else MortgageCalculatorTables.clearTables(!0)
    },
    calculateAPR: function (t) {
        var e = 12 * t.loanterm.value,
            a = t.interestrate.value / 100 / 12,
            r = t.loanamount.value,
            n = this.getClosingCosts(t, r, 12 * a),
            o = this.getDateForBeginningOfCurrentMonth(),
            i = this.getMonthlyPayment(a, e, r),
            s = +r + +n,
            l = this.getMonthlyPayment(a, e, s);
        if ("Adjustable Rate" === t.loantype.value) {
            var u = {
                monthlyRate: a,
                loanAmount: s,
                termMonths: e,
                monthlyPayment: l,
                beginningDate: o,
                maxPeriodicMonthlyRateIncrease: t.maxperiodicrateincrease.value / 100 / 12,
                maxLifetimeMonthlyRateIncrease: t.maxlifetimerateincrease.value / 100 / 12,
                monthsWithInitialRate: t.presentratechangesafter.value,
                monthsBetweenRateChanges: t.ratecanchangeevery.value
            },
                c = this.getAmortizationSchedule(u),
                d = this.sum(c, "payment");
            l = this.round(d / c.length)
        }
        for (var m = a; this.getMonthlyPayment(m, e, r) < l;) m += 1e-5 / 12;
        var h = {
            initialmonthlypayment: i,
            apr: 12 * m * 100
        };
        this.setResults(h)
    },
    getClosingCosts: function (t, e, a) {
        return "Enter Total Closing Costs" === t.closingcosts.value ? t.totalclosingcosts.value : +t.pointstolender.value / 100 * e + +t.loanoriginationfeetolender.value + +t.pointstobroker.value / 100 * e + +t.loanoriginationfeetobroker.value + 15 * +t.yearlyprivatemortgageinsurance.value / 365 + +t.lendersinspectionfee.value + +t.taxservicefee.value + +t.underwritingreviewfee.value + +t.applicationfee.value + +t.brokerprocessingfee.value + +t.otherexclappraisaltitleescrowattorney.value + e * a * 15 / 365
    },
    calculateRentVsOwn: function (t) {
        var e, a = +t.homepurchaseprice.value,
            r = +t.howlongbeforeselling.value,
            n = 12 * r,
            o = .003 * a / 12,
            i = t.annualhomemaintenance.value / 100 * a,
            s = a - t.downpayment.value,
            l = s / a,
            u = s * this.getInsurancePerLoanDollar(l),
            c = t.mortgageinterestrate.value / 100 / 12,
            d = this.getMonthlyPayment(c, 360, s),
            m = this.getPrincipalAndInterestPaid(c, s, d, 0, n),
            h = t.propertytaxrate.value / 100,
            g = (t.estimatedhomepurchasecosts.value / 100 * a + h * a * r + m.interestPaid) * t.yourincometaxrate.value / 100,
            p = h * a / 12,
            f = +t.monthlyrent.value,
            v = +t.monthlyrentersinsurance.value,
            y = f + v,
            b = d + p + o + u,
            P = t.annualrentincrease.value / 100;
        e = 0 !== P ? 12 * f * (Math.pow(1 + P, r) - 1) / P + v * n : y * n;
        var w = b * n + i * r,
            T = e / n,
            R = (w - g) / n,
            M = T - R,
            C = a * Math.pow(1 + t.annualhomeappreciation.value / 100, r),
            A = C * t.sellingcosts.value / 100,
            I = (+t.downpayment.value + +t.estimatedhomepurchasecosts.value / 100 * a) * Math.pow(1 + t.interestearnedondownpayment.value / 100 / 12, n),
            D = s - m.principalPaid,
            x = C - A - D - I,
            E = e - w + g,
            O = x + E,
            k = O > 0 ? "Own" : "Rent",
            S = {
                "shouldyourentorown?": k,
                averagemonthlypaymentsavings: {
                    value: M,
                    label: "Average Monthly Payment Savings if " + k + "ing"
                },
                estimatedtotalgain: {
                    value: Math.abs(O),
                    label: "Estimated Total Gain if " + k + "ing"
                }
            };
        this.setResults(S);
        var F = [{
            description: "Initial Rent Payment",
            rent: f,
            own: "-"
        }, {
            description: "Renter's Insurance",
            rent: v,
            own: "-"
        }, {
            description: "Mortgage Payment",
            rent: "-",
            own: d
        }, {
            description: "PMI (Mortgage Insurance)",
            rent: "-",
            own: u
        }, {
            description: "Property Taxes",
            rent: "-",
            own: p
        }, {
            description: "Homeowner's Insurance",
            rent: "-",
            own: o
        }, {
            description: "Before Tax Monthly Payment",
            rent: y,
            own: b
        }, {
            description: "Annual Home Maintenance",
            rent: "-",
            own: i
        }, {
            description: "Total Payments Over " + r + " Years",
            rent: e,
            own: w
        }, {
            description: "Total Tax Savings Over " + r + " Years",
            rent: "-",
            own: g
        }, {
            description: "Average After Tax Monthly Payment",
            rent: T,
            own: R
        }],
            L = {
                header: "Payment Considerations",
                rowHeaders: ["description", "rent", "own"],
                rows: this.formatRentVsOwnRows(JSON.parse(JSON.stringify(F)))
            },
            N = [{
                description: "Estimated Home Selling Price",
                total: C
            }, {
                description: "Loan Balance",
                total: D
            }, {
                description: "Estimated Cost to Sell",
                total: A
            }, {
                description: "Down Payment & Initial Closing Costs with Unearned Interest",
                total: I
            }, {
                description: "Investment Gain of Owning vs. Renting",
                total: x
            }, {
                description: "Total Payment Savings of Owning vs. Renting",
                total: E
            }, {
                description: "Combined Gain of Owning vs. Renting",
                total: O
            }],
            U = {
                header: "Investment Considerations After " + r + " Years",
                rowHeaders: ["description", "total"],
                rows: this.formatRentVsOwnRows(JSON.parse(JSON.stringify(N)))
            };
        MortgageCalculatorTables.init([], [L, U], this.formId, !1)
    },
    calculateDebtConsolidation: function (t) {
        t["balance-0"] = t.balance, t["typeofcredit-0"] = t.typeofcredit, t["monthlypayment-0"] = t.monthlypayment, t["interestrate-0"] = t.interestrate;
        for (var e = parseFloat(t.term.value), a = parseFloat(t.newinterestrate.value), r = parseFloat(t.estimatedclosingcosts.value), n = 0, o = 0, i = 0, s = 0, l = 0, u = 0, c = 0; c <= (MortgageCalculatorDebtUtils.cloneCount && MortgageCalculatorDebtUtils.cloneCount[t.type.properties.id] ? MortgageCalculatorDebtUtils.cloneCount[t.type.properties.id] : 0); c++)
            if (void 0 !== t["balance-" + c]) {
                var d = parseFloat(t["balance-" + c].value),
                    m = parseFloat(t["monthlypayment-" + c].value),
                    h = t["interestrate-" + c].value / 100 / 12,
                    g = this.getAmortizationSchedule({
                        loanAmount: d,
                        monthlyRate: h,
                        monthlyPayment: m,
                        termMonths: 1e4,
                        beginningDate: new Date
                    });
                i += d, s += m, g.length > n && (n = g.length), "mortgage" === t["typeofcredit-" + c] && g.length > o && (o = g.length), u += this.sum(g, "interest")
            }
        l = i + u;
        var p = 12 * e,
            f = a / 100 / 12,
            v = this.getMonthlyPayment(f, p, i),
            y = this.getPrincipalAndInterestPaid(f, i, v, 0, p).interestPaid,
            b = i + y + r,
            P = {
                blank: "After Debts Consolidated",
                monthlyPayment: v,
                timeToPayOffAllDebts: p,
                "totalInterest&RefinanceCosts": y,
                totalPayout: b
            },
            w = this.getMonthlyPayment(f, n, i),
            T = n,
            R = this.getPrincipalAndInterestPaid(f, i, w, 0, T).interestPaid,
            M = i + R + r,
            C = {
                blank: "After Debts Consolidated",
                monthlyPayment: w,
                timeToPayOffAllDebts: T,
                "totalInterest&RefinanceCosts": R,
                totalPayout: M
            },
            A = s,
            I = this.getAmortizationSchedule({
                loanAmount: i,
                monthlyRate: f,
                monthlyPayment: A,
                termMonths: 1e4,
                beginningDate: new Date
            }),
            D = I.length,
            x = this.sum(I, "interest"),
            E = i + x + r,
            O = {
                blank: "After Debts Consolidated",
                monthlyPayment: A,
                timeToPayOffAllDebts: D,
                "totalInterest&RefinanceCosts": x,
                totalPayout: E
            },
            k = {
                blank: "Present Financing",
                monthlyPayment: s,
                timeToPayOffAllDebts: n,
                "totalInterest&RefinanceCosts": u,
                totalPayout: l
            },
            S = "1. Full " + e + " Year Term of the New Loan",
            F = this.buildDebtConsolidationTable(S, k, P),
            L = this.buildDebtConsolidationTable("2. Keeping Original Home Pay Off Date", k, C),
            N = this.buildDebtConsolidationTable("3. Keeping Original Monthly Payment", k, O);
        MortgageCalculatorTables.init([], [F, L, N], this.formId, !1);
        var U = this.monthsToYearsAndMonthsString(Math.abs(n - D));
        U += n >= D ? " earlier" : " later";
        var B = s >= v ? "decreased" : "increased",
            $ = s >= w ? "decreased" : "increased",
            H = new Date;
        H.setMonth(H.getMonth() + n), H = this.getMonthAndYearFromDate(H);
        var j = {
            totaldebttoberefinanced: i,
            "ifusingthetermofthenewloan,themonthlypaymentdecreasedby:": {
                value: Math.abs(s - v),
                label: "If using the full " + e + " year term of the new loan, the monthly payment " + B + " by:"
            },
            "ifkeepingtheorginalpayoffdate,themonthlypaymentdecreasedby:": {
                value: Math.abs(s - w),
                label: "If keeping the original pay off date (" + H + "), the monthly payment " + $ + " by:"
            },
            "ifkeepingtheorginalpayment,alldebtwillbepaidoff:": U
        };
        this.setResults(j)
    },
    calculateRates: function (t) {
        RatesCalculator.calculateRates(t, this.formId, this.setResults.bind(this))
    },
    getInsurancePerLoanDollar: function (t) {
        return t <= .8 ? 0 : t <= .85 ? .23 / 1200 : t <= .9 ? 325e-6 : t <= .95 ? .71 / 1200 : t <= .97 ? .95 / 1200 : 0
    },
    calculateTaxSavings: function (t) {
        var e = 12 * t.loanterm.value,
            a = t.interestrate.value / 100 / 12,
            r = +t.loanamount.value,
            n = t.calculatetaxsavingsafter.value,
            o = t.yourincometaxrate.value / 100,
            i = t.points.value / 100,
            s = this.getMonthlyPayment(a, e, r),
            l = this.round(t.propertyvalue.value * t.propertytaxrate.value / 100),
            u = this.getTaxSavingsSchedule(n, a, e, r, s, l, o, i),
            c = this.round(this.sum(u, "yearlyTaxSavings"));
        this.setResults({
            totaltaxsavings: c,
            monthlymortgagepayment: s,
            annualpropertytax: l
        });
        var d = this.getTaxSavingsTableFromSchedule(u);
        MortgageCalculatorTables.init(["year", "mortgagePayment", "interestPaid", "yearlyTaxSavings"], [d], this.formId, !1)
    },
    getTaxSavingsSchedule: function (t, e, a, r, n, o, i, s) {
        for (var l = [], u = r, c = 0; c < t; c++) {
            var d = this.getPrincipalAndInterestPaid(e, u, n, 12 * c, 12 * c + 12);
            l.push({
                year: "Year " + (c + 1),
                mortgagePayment: 12 * n + o,
                interestPaid: d.interestPaid,
                yearlyTaxSavings: this.round(i * (d.interestPaid + o))
            }), u -= d.principalPaid
        }
        return l[0].yearlyTaxSavings += this.round(s * r * i), l
    },
    isMonthToMakeAdditionalPayment: function (t, e) {
        var a = new Date,
            r = 12 - a.getMonth();
        return "Starting Next Month" === e.firstAdditionalPayment ? "Monthly" === e.additionalPaymentAmountFrequency ? t > 0 : t % 12 == 1 : "Starting Next Year" === e.firstAdditionalPayment ? "Monthly" === e.additionalPaymentAmountFrequency ? t >= r : t >= r && (t - r) % 12 == 0 : "One Year From Now" === e.firstAdditionalPayment ? "Monthly" === e.additionalPaymentAmountFrequency ? t >= 12 : t >= 12 && t % 12 == 0 : void 0
    },
    getPercentageOfLoanAmountPerMonth: function (t, e) {
        return e <= 0 ? 1 : t / (1 - 1 / Math.pow(1 + t, e))
    },
    getMonthlyPayment: function (t, e, a) {
        return this.round(this.getPercentageOfLoanAmountPerMonth(t, e) * a)
    },
    getPrincipalAndInterestPaid: function (t, e, a, r, n) {
        for (var o = 0, i = 0, s = 0, l = 0, u = r; u < n; u++) s = this.round(e * t), l = a - s, e -= l, o += s, i += l;
        return {
            principalPaid: i,
            interestPaid: o
        }
    },
    getAmortizationSchedule: function (t) {
        for (var e, a = [], r = t.loanAmount, n = t.monthlyRate, o = t.monthlyPayment, i = new Date(JSON.parse(JSON.stringify(t.beginningDate))), s = 0; s < t.termMonths; s++) {
            a[s] = {
                timePeriod: this.getMonthAndYearFromDate(i),
                extraPayment: 0
            }, void 0 === t.monthsWithInitialRate || s < t.monthsWithInitialRate ? (a[s].payment = t.monthlyPayment, t.hasOwnProperty("additionalPaymentAmount") && this.isMonthToMakeAdditionalPayment(s, t) && (a[s].extraPayment = t.additionalPaymentAmount)) : ((s - t.monthsWithInitialRate) % t.monthsBetweenRateChanges == 0 && (e = t.monthlyRate + t.maxLifetimeMonthlyRateIncrease, n < e && (n = Math.min(n + t.maxPeriodicMonthlyRateIncrease, e), o = this.getMonthlyPayment(n, t.termMonths - s, r))), a[s].payment = o, t.hasOwnProperty("additionalPaymentAmount") && this.isMonthToMakeAdditionalPayment(s, t) && (a[s].extraPayment = t.additionalPaymentAmount));
            var l = a[s].payment;
            l += a[s].hasOwnProperty("extraPayment") ? a[s].extraPayment : 0;
            var u = this.getPrincipalAndInterestPaid(n, r, l, s, s + 1);
            if (a[s].principal = u.principalPaid, a[s].interest = u.interestPaid, r -= u.principalPaid, s === t.termMonths - 1 || r <= 0) {
                0 === a[s].extraPayment ? a[s].payment += r : a[s].extraPayment += r, a[s].principal += r, r = 0, a[s].balance = r, a[s].principal + a[s].interest <= a[s].payment && (a[s].extraPayment = 0, a[s].payment = a[s].principal + a[s].interest);
                break
            }
            a[s].balance = r, i.setMonth(i.getMonth() + 1)
        }
        return a
    },
    getAmortizationTableFromSchedule: function (t, e) {
        var a, r, n = [];
        if (n.push({
            header: "Grand Total",
            totals: this.getAmortizationTotals(t, !0)
        }), "Monthly" === e)
            for (a = 0; a < t.length; a += 12) r = JSON.parse(JSON.stringify(t.slice(a, a + 12))), n.push({
                header: "Monthly Amortization Schedule - Year " + (a / 12 + 1),
                rows: this.formatAmortizationRows(JSON.parse(JSON.stringify(r))),
                totals: this.getAmortizationTotals(r, !0, !0)
            });
        else if ("Yearly" === e) {
            var o = [];
            for (a = 0; a < t.length; a += 12) r = JSON.parse(JSON.stringify(t.slice(a, a + 12))), o.push(this.getAmortizationTotals(r, !1));
            n.push({
                header: "Yearly Amortization Schedule",
                rows: this.formatAmortizationRows(JSON.parse(JSON.stringify(o)))
            })
        }
        return n
    },
    getAmortizationTotals: function (t, e, a) {
        var r = this.sum(t, "payment"),
            n = this.sum(t, "principal"),
            o = this.sum(t, "interest"),
            i = t[t.length - 1].balance,
            s = this.sum(t, "extraPayment");
        return e && (r = "$" + MortgageCalculatorUtils.formatNumbers(r.toFixed(2), 2, !0), n = "$" + MortgageCalculatorUtils.formatNumbers(n.toFixed(2), 2, !0), o = "$" + MortgageCalculatorUtils.formatNumbers(o.toFixed(2), 2, !0), i = "$" + MortgageCalculatorUtils.formatNumbers(i.toFixed(2), 2, !0), s = "$" + MortgageCalculatorUtils.formatNumbers(s.toFixed(2), 2, !0)), {
            timePeriod: a ? "Total" : t[0].timePeriod + " - " + t[t.length - 1].timePeriod,
            payment: r,
            principal: n,
            interest: o,
            balance: i,
            extraPayment: s
        }
    },
    buildDebtConsolidationTable: function (t, e, a) {
        var r = ["blank", "monthlyPayment", "timeToPayOffAllDebts", "totalInterest&RefinanceCosts", "totalPayout"],
            n = [e, a],
            o = {
                blank: "Payment Reduction",
                monthlyPayment: e.monthlyPayment - a.monthlyPayment,
                timeToPayOffAllDebts: "",
                "totalInterest&RefinanceCosts": e["totalInterest&RefinanceCosts"] - a["totalInterest&RefinanceCosts"],
                totalPayout: e.totalPayout - a.totalPayout
            };
        return n.push(o), {
            header: t,
            rowHeaders: r,
            rows: this.formatDebtConsolidationRows(JSON.parse(JSON.stringify(n)))
        }
    },
    formatAmortizationRows: function (t) {
        for (var e = 0; e < t.length; e++) t[e].payment = "$" + MortgageCalculatorUtils.formatNumbers(t[e].payment.toFixed(2), 2, !0), t[e].principal = "$" + MortgageCalculatorUtils.formatNumbers(t[e].principal.toFixed(2), 2, !0), t[e].interest = "$" + MortgageCalculatorUtils.formatNumbers(t[e].interest.toFixed(2), 2, !0), t[e].balance = "$" + MortgageCalculatorUtils.formatNumbers(t[e].balance.toFixed(2), 2, !0), t[e].extraPayment = "$" + MortgageCalculatorUtils.formatNumbers(t[e].extraPayment.toFixed(2), 2, !0);
        return t
    },
    formatRentVsOwnRows: function (t) {
        for (var e, a = 0; a < t.length; a++) "number" == typeof t[a].rent && (e = "$" + MortgageCalculatorUtils.formatNumbers(t[a].rent.toFixed(2), 2, !0), t[a].rent = t[a].rent < 0 ? "(" + e + ")" : e), "number" == typeof t[a].own && (e = "$" + MortgageCalculatorUtils.formatNumbers(t[a].own.toFixed(2), 2, !0), t[a].own = t[a].own < 0 ? "(" + e + ")" : e), "number" == typeof t[a].total && (e = "$" + MortgageCalculatorUtils.formatNumbers(t[a].total.toFixed(2), 2, !0), t[a].total = t[a].total < 0 ? "(" + e + ")" : e);
        return t
    },
    formatDebtConsolidationRows: function (t) {
        for (var e = 0; e < t.length; e++) t[e].monthlyPayment = "$" + MortgageCalculatorUtils.formatNumbers(t[e].monthlyPayment.toFixed(2), 2, !0), t[e].timeToPayOffAllDebts = t[e].timeToPayOffAllDebts ? this.monthsToYearsAndMonthsString(t[e].timeToPayOffAllDebts) : "", t[e]["totalInterest&RefinanceCosts"] = "$" + MortgageCalculatorUtils.formatNumbers(t[e]["totalInterest&RefinanceCosts"].toFixed(2), 2, !0), t[e].totalPayout = "$" + MortgageCalculatorUtils.formatNumbers(t[e].totalPayout.toFixed(2), 2, !0);
        return t
    },
    getTaxSavingsTableFromSchedule: function (t) {
        return {
            header: "Payment Considerations",
            rows: this.formatTaxSavingsRows(JSON.parse(JSON.stringify(t))),
            totals: this.getTaxSavingsTotals(t, !0)
        }
    },
    formatTaxSavingsRows: function (t) {
        for (var e = 0; e < t.length; e++) t[e].mortgagePayment = "$" + MortgageCalculatorUtils.formatNumbers(t[e].mortgagePayment.toFixed(2), 2, !0), t[e].interestPaid = "$" + MortgageCalculatorUtils.formatNumbers(t[e].interestPaid.toFixed(2), 2, !0), t[e].yearlyTaxSavings = "$" + MortgageCalculatorUtils.formatNumbers(t[e].yearlyTaxSavings.toFixed(2), 2, !0);
        return t
    },
    getTaxSavingsTotals: function (t, e) {
        var a = this.sum(t, "mortgagePayment"),
            r = this.sum(t, "interestPaid"),
            n = this.sum(t, "yearlyTaxSavings");
        return e && (a = "$" + MortgageCalculatorUtils.formatNumbers(a.toFixed(2), 2, !0), r = "$" + MortgageCalculatorUtils.formatNumbers(r.toFixed(2), 2, !0), n = "$" + MortgageCalculatorUtils.formatNumbers(n.toFixed(2), 2, !0)), {
            year: "Total",
            mortgagePayment: a,
            interestPaid: r,
            yearlyTaxSavings: n
        }
    },
    monthsToYearsAndMonthsString: function (t) {
        if (t <= 0) return "0 Years, 0 Months";
        var e = t / 12,
            a = Math.floor(e),
            r = t - 12 * a,
            n = 1 === a ? "Year" : "Years",
            o = 1 === r ? "Month" : "Months",
            i = a > 0 ? a + " " + n : "";
        return i += a > 0 && r > 0 ? ", " : "", i += r > 0 ? r + " " + o : ""
    },
    getDateFromMonthAndYear: function (t) {
        var e = t.split("/"),
            a = parseInt(e[0], 10) - 1,
            r = parseInt(e[1], 10);
        return new Date(r, a, 1)
    },
    getMonthAndYearFromDate: function (t) {
        var e = t.getMonth() + 1;
        return (e = e < 10 ? "0" + e : e) + "/" + t.getFullYear()
    },
    getDateForBeginningOfCurrentMonth: function () {
        var t = new Date;
        return new Date(t.getFullYear(), t.getMonth(), 1)
    },
    sum: function (t, e) {
        return t.reduce(function (t, a) {
            return t + a[e]
        }, 0)
    },
    round: function (t) {
        return Math.round(100 * (t + 1e-5)) / 100
    }
};

var RatesCalculator = function () {
    function t(t, e) {
        window.setTimeout(function () {
            var a = document.querySelector("[name='" + t + "']"),
                r = document.querySelector("[name='" + e + "']");
            if (a && r) {
                var n = window.CountyList.filter(function (t) {
                    return t.abbreviation === a.value
                });
                r.innerHTML = n.length > 0 ? n[0].counties.map(function (t) {
                    var e = void 0,
                        a = void 0;
                    return "string" == typeof t ? e = a = t : (e = t.text, a = t.value), ['<option value="' + a + '">', e, "</option>"].join("")
                }).join("") : r.innerHTML
            }
        }, 0)
    }

    function e() {
        var t = document.getElementById("rates-api-settings-json"),
            e = {};
        return t && (e = JSON.parse(t.innerHTML)), e.productPricingProvider = e.productPricingProvider || EPPS, e
    }

    function a(t, e) {
        e = void 0 === e || e;
        var a = "#rates-calculator-results-js-" + t;
        return e ? a : a.replace("#", "")
    }

    function r() {
        if (w()) {
            $(a(M)).animate({
                scrollTop: 0
            }, "slow")
        }
    }

    function n(t) {
        t = t || 0;
        var a, r = MortgageCalculatorUtils.isEPCPPE() ? EPC : e().productPricingProvider,
            n = RatesFieldMapping.config.api.GetRatesUriTokens[r],
            i = this,
            s = !1,
            l = this.tableData.filter(function (t) {
                return t.isRootProgramRecord
            });
        i.disableForm(!0), i.productGroupIdsLoaded = [], c(!1);
        var d = function (t) {
            a = i.ratesApiUrl + n.replace("{LOANID}", t.loanId).replace("{SITEID}", i.siteId);
            var e = "",
                r = "";
            return t.productGroupId ? (e = "ProductGroupId", r = t.productGroupId) : (e = "ProgramId", r = t.programId), a = a.replace("{TERM_KEY}", e).replace("{TERM_VALUE}", r), $.ajax({
                method: "GET",
                url: a,
                headers: {
                    Authorization: "Bearer " + i.token
                },
                error: function (t) {
                    c(!0), u(!1)
                },
                complete: function () {
                    ++I >= D && (s = !0, o()), i.disableForm(!1), 0 === i.tableData.length && i.setResults({
                        error: i.errorMessage
                    })
                }
            })
        },
            m = l.slice(t, t + this.indexIncrement);
        return $.when.apply($, m.map(function (t) {
            return i.productGroupIdsLoaded.push(t.productGroupId || t.programId), d(t)
        })).then(function () {
            var e = Array.prototype.slice.call(arguments).map(function (t) {
                return Array.isArray(t) ? t[0] : t
            }),
                a = e.filter(function (t) {
                    return void 0 !== t && t.NumberOfLoanPrograms > 0 && t.Aprs && t.Aprs.length
                });
            a.length > 0 ? (a.forEach(function (t) {
                var e = i.getRateViewModels(t.Aprs);
                i.addRatesToResults(e)
            }), i.displayResults(), s || this.buildPagination(t + this.indexIncrement)) : i.setResults({
                error: i.errorMessage
            })
        }.bind(this))
    }

    function o() {
        s(R)
    }

    function s(t) {
        t && Array.isArray(t) ? t.forEach(function (t) {
            t && t.remove()
        }) : t && t.remove()
    }

    function l(t, e) {
        R && ("disabled" === t ? R.find("button").prop("disabled", e) : R.attr(t, e))
    }

    function u(t) {
        $(".rates-loading-animation-small-container").toggle(t)
    }

    function c(t) {
        var e = "rates-calculator-loadmore-error-hidden",
            a = "#rates-calculator-loadmore-error";
        t && $(a).hasClass(e) ? $(a).removeClass(e) : $(a).addClass(e)
    }

    function d(t, e) {
        u(!0), n.call(O, e).then(function () {
            u(!1), v({
                target: {
                    value: g().val()
                }
            })
        })
    }

    function m() {
        return x.div({
            class: "spinner-container rates-loading-animation-small-container",
            id: "rates-loading-animation"
        })([x.div({
            class: "spinner-circle no-spinner-color-animation theme-title-text-spinner"
        })])
    }

    function h(t, e) {
        var r = "rates-calculator-pagination-container-" + t,
            n = "rates-calculator-loadmore-button-" + t,
            o = x.span({
                id: "rates-calculator-loadmore-error",
                class: "rates-calculator-loadmore-error rates-calculator-loadmore-error-hidden"
            })();
        return x.div({
            id: r,
            class: "rates-calculator-pagination",
            "data-ref": "pager"
        })([o, x.button({
            id: n,
            class: "btn rates-calculator-loadmore-button",
            "data-results-pane-ref": a(t, !0),
            "data-nextSliceIndex": e,
            onclick: function (t) {
                d.call(O, t, +$(t.target).attr("data-nextSliceIndex"))
            }
        })("Show More"), m()])
    }

    function g() {
        return $("#" + E)
    }

    function p(t, e) {
        var a = $("#" + e + " .mortgage-calculators-widget-results:first"),
            r = x.h3({
                class: "mortgage-calculators-widget-subtitle theme-title-text"
            })("Filter Loan Programs By"),
            n = x.div({
                class: "rates-select-filter-holder"
            }),
            o = x.select({
                id: "rates-program-filter-select",
                class: "rates-select-filter",
                "aria-label": "Filter Loan Programs by",
                onchange: function (t) {
                    v(t)
                }
            })(f(t)),
            i = n([r, o]);
        return a.append(i), i
    }

    function f(t) {
        return (t || []).map(function (t) {
            return x.option({
                value: t.value
            })(t.text)
        })
    }

    function v(t) {
        var e = t.target.value,
            r = $(a(M));
        e ? (r.find("ul li div.rates-calculator-result-term div.rates-calculator-results-table-title").each(function (t) {
            var a = this;
            a.parentElement.style.display = a.textContent === e ? "block" : "none"
        }), r.find("ul li div.rates-calculator-result-term div.rates-calculator-results-mobile-table-title").each(function (t) {
            var a = this;
            a.parentElement.style.display = a.textContent === e ? "block" : "none"
        })) : r.find("ul li div.rates-calculator-result-term").show()
    }

    function y(t) {
        var e = g();
        t.forEach(function (t) {
            e.find('option[value="' + t.value + '"]').length > 0 || e.append(f([t])[0])
        })
    }

    function b() {
        return O.tableData ? O.tableData.filter(P).reduce(function (t, e) {
            var a = {
                text: e.term,
                value: e.term
            },
                r = function (t) {
                    return t.value === a.value
                };
            return 0 === t.filter(r).length && t.push(a), t
        }, [{
            text: "Select All",
            value: ""
        }]) : []
    }

    function P(t) {
        var e = O,
            a = t.productGroupId ? t.productGroupId : t.programId;
        return (+a == +e.productGroupIdsLoaded[0] || +a == +e.productGroupIdsLoaded[1]) && void 0 !== t.programId && !0 === t.isFullyLoaded
    }

    function w() {
        return O.ratesApiSettings.productPricingProvider === EPPS
    }



    function T(t) {
        return t ? t.ProgramName : ""
    }

    var R, M, C, A = window.Elli.utils,
        I = 0,
        D = 0,
        x = A.tags,
        E = "rates-program-filter-select",
        O = {
            tokenApiUrl: null,
            ratesApiUrl: null,
            widgetApiUrl: null,
            consumerApiUrl: null,
            errorMessage: "Failed to get rates. Please try your request again.",
            noRatesMessageHeader: "We're sorry, we couldn't find any loan options for you at this time.",
            noRatesMessageBody: "Please retry by changing your loan criteria.",
            token: null,
            formData: {},
            id: M,
            siteId: null,
            loanAppWidgetId: null,
            tableData: [],
            startingIndex: 0,
            endingIndex: 6,
            indexIncrement: 2,
            pageNumber: 1,
            setResults: null,
            utils: null,
            productGroupIdsLoaded: [],
            ratesApiSettings: "",
            stateTooltipIcon: null,
            stateTooltipContent: null,
            ratesDetails: {},
            ratesObserversCleanup: {},
            init: function () {
                var t = document.querySelector("input[name=type][value=Rates]");
                if (t) {
                    this.utils = A;
                    var a = MortgageCalculatorUtils.closest(t, "mortgage-calculators-widget-form");
                    this.siteId = a.querySelector('input[name="site-id"]').value;
                    this.tokenApiUrl = a.querySelector('input[name="token-api-url"]').value;
                    this.tokenApiUrl.indexOf("/v1/token") < 0 && (this.tokenApiUrl += "/v1/token");
                    this.ratesApiUrl = a.querySelector('input[name="rates-api-url"]').value;
                    this.ratesApiUrl.indexOf("/v0.9/rates") < 0 && (this.ratesApiUrl += "/v0.9/rates");
                    var r = a.querySelector('input[name="consumer-api-url"]');
                    this.consumerApiUrl = r ? r.value : this.ratesApiUrl.match(/^(https?:\/\/[^/]+)/)[1] + "/consumers";
                    this.consumerApiUrl.indexOf("/v1/rates/payments") < 0 && (this.consumerApiUrl += "/v1/rates/payments");
                    this.ratesApiSettings = e();
                    this.showHideDependentFields();
                    (this.ratesApiSettings.productPricingProvider === OB || MortgageCalculatorUtils.isEPCPPE()) && (this.stateTooltipIcon = document.querySelector("#state-icon-tooltip"), this.stateTooltipContent = document.querySelector("#state-tooltip-content"), this.setupTooltipEventListeners(this.stateTooltipIcon, this.stateTooltipContent), document.addEventListener("keydown", this.closeTooltipOnKeyPress.bind(this)));
                }
            },
            calculateRates: function (t, a, r) {
                this.ratesApiSettings = e();
                this.formData = t;
                this.id = a;
                M = a;
                this.setResults = r;
                this.resetRates();
                this.setResults({ ratesspinner: !0 });
                this.getRates();
            },
            resetRates: function () {
                this.startingIndex = 0;
                this.endingIndex = 6;
                this.indexIncrement = 2;
                this.pageNumber = 1;
                this.tableData = [];
                this.ratesDetails = {};
                this.disconnectAllRatesObservers();
                I = 0;
                s([R, C]);
                R = void 0;
                C = void 0;
                var t = document.getElementById(a(this.id, !1));
                t && (t.innerHTML = "");
            },
            disconnectAllRatesObservers: function () {
                var t = this;
                Object.keys(t.ratesObserversCleanup).forEach(function (e) {
                    "function" == typeof t.ratesObserversCleanup[e] && t.ratesObserversCleanup[e]();
                    delete t.ratesObserversCleanup[e];
                });
            },
            attachAccordionObserver: function (t) {
                function e(t, e) {
                    var a = t.get(0).getBoundingClientRect(),
                        r = e.get(0).getBoundingClientRect();
                    return r.bottom > a.bottom && r.top < a.bottom && r.bottom <= a.bottom + t.height();
                }
                var r = $(a(M)),
                    n = !1,
                    o = t.outerHeight(),
                    i = function (t, e) {
                        var a;
                        return function () {
                            var r = this,
                                n = arguments;
                            clearTimeout(a);
                            a = setTimeout(function () {
                                t.apply(r, n);
                            }, e);
                        };
                    }(function () {
                        !n && t.length && r.length && setTimeout(function () {
                            var a = t.outerHeight();
                            if (!(Math.abs(a - o) < 20) && e(r, t)) {
                                o = a;
                                var i = t.offset().top,
                                    s = r.offset().top,
                                    l = i - s,
                                    u = r.scrollTop(),
                                    c = t.outerHeight(),
                                    d = r.height(),
                                    m = Math.max(0, u + l + c - d + 15);
                                Math.abs(m - u) > 5 && (n = !0, r.animate({ scrollTop: m }, 150, function () {
                                    n = !1;
                                }));
                            }
                        }, 0);
                    }, 250),
                    s = new MutationObserver(i);
                return t.length && s.observe(t.get(0), { childList: !0, subtree: !0, characterData: !0 }), function () {
                    s.disconnect();
                };
            },
            toggleRatesDetailsAccordion: function (t, e) {
                var a = t.currentTarget || t.target;
                if (a) {
                    var r = $(a),
                        n = r.closest(".rates-calculator-results-payment-wrapper").get(0);
                    if (n) {
                        var o = $(n),
                            i = "true" === r.attr("aria-expanded"),
                            s = o.get(0).dataset || {},
                            l = Object.keys(s).map(function (t) {
                                return t + "-" + s[t];
                            }).join("-");
                        r.attr("aria-expanded", !i);
                        o.toggleClass("rates-breakdown-active");
                        o.find(".mortgage-calculators-error").remove();
                        o.find(".rates-calculator-breakdown-table-wrapper").remove();
                        o.hasClass("rates-breakdown-active") ? ("undefined" != typeof MutationObserver && (this.ratesObserversCleanup[l] = this.attachAccordionObserver(o)), this.getRatesBreakdown(n, e)) : (o.focus(), "function" == typeof this.ratesObserversCleanup[l] && (this.ratesObserversCleanup[l](), delete this.ratesObserversCleanup[l]));
                    }
                }
            },
            getRatesBreakdown: function (t, e) {
                var a = t.dataset,
                    r = this.formData["site-id"].value,
                    n = a.loanId,
                    o = a.programId,
                    i = a.productGroupId,
                    s = a.rateId,
                    l = s + "_" + n;
                i ? l += "_" + i : o && (l += "_" + o);
                var u = "preloader-" + l,
                    c = this,
                    d = function () {
                        $("#" + u).remove();
                        c.clearResultsAnnouncement();
                    },
                    m = function (a) {
                        c.ratesDetails[l] = a;
                        c.createRatesBreakdownTable(t, a, e);
                    },
                    h = c.ratesDetails[l];
                if (l in c.ratesDetails && null !== h) Array.isArray(h) && m(h);
                else {
                    this.ratesDetails[l] = !0;
                    var g = $(t),
                        p = x.div({ id: u, class: "rates-calculator-payments-preloader", "data-testid": "rates-calculator-payments-preloader" })('<div class="spinner-circle no-spinner-color-animation theme-title-text-spinner"></div>');
                    g.append(p);
                    var f = function (e) {
                        c.createResultsAnnouncement("Loading rate details.");
                        var a = "";
                        i ? a = "&productGroupId=" + i : o && (a = "&programId=" + o);
                        $.ajax({
                            method: "GET",
                            url: c.consumerApiUrl + "?siteId=site:" + r + "&loanId=" + n + "&id=" + s + a,
                            contentType: "application/json",
                            dataType: "json",
                            headers: { Authorization: "Bearer " + e },
                            success: function (e) {
                                d();
                                Array.isArray(e) && e.length > 0 ? m(e) : (c.ratesDetails[l] = null, c.displayRatesDetailsError(t));
                            },
                            error: function (e, a, r) {
                                d();
                                c.ratesDetails[l] = null;
                                c.displayRatesDetailsError(t);
                            }
                        });
                    };
                    this.getToken(function (t) {
                        f(t);
                    });
                }
            },
            displayRatesDetailsError: function (t) {
                var e = "<div>Sorry, we are unable to fetch the data. </div><div>Please try again later.</div>",
                    a = x.div({ class: "rates-calculator-payments-error", "data-testid": "rates-calculator-payments-error", "data-error": "y" })("<span></span>" + e),
                    r = MortgageCalculator.createErrorElement($(a).prop("outerHTML"));
                $(t).append(r);
                this.createResultsAnnouncement("An error occurred. " + e);
            },
            createRatesBreakdownTable: function (t, e, a) {
                var r = document.createElement("div"),
                    n = "rates-calculator-breakdown-table";
                r.classList.add(n + "-wrapper");
                var o = '<table data-testid="' + n + '" class="' + n + '" role="table" aria-describedby="' + $(t).find(".rates-calculator-payments-details").attr("id") + '"tabindex="0 " onkeydown="RatesCalculator.handleBreakdownTableKeypress(event);">';
                if ("desktop" === a) {
                    o += '<tr class="' + n + '-tr">' + this.buildTableBreakdownTags("th", "No. of Payments", a) + this.buildTableBreakdownTags("th", "Interest Rate", a) + this.buildTableBreakdownTags("th", "Monthly Payment (P&I)", a) + "</tr>";
                    for (var i = 0; i < e.length; i++) {
                        var s = e[i],
                            l = MortgageCalculatorUtils.formatNumbers(s.monthlyPayment.toFixed(2), 2, !0);
                        o += '<tr class="' + n + '-tr">' + this.buildTableBreakdownTags("td", s.numberOfPayments, a) + this.buildTableBreakdownTags("td", Number(s.interestRatePercent).toFixed(3) + "%", a) + this.buildTableBreakdownTags("td", A.stringBuilder("$" + l), a) + "</tr>";
                    }
                } else
                    for (var i = 0; i < e.length; i++) {
                        var s = e[i],
                            l = MortgageCalculatorUtils.formatNumbers(s.monthlyPayment.toFixed(2), 2, !0);
                        o += '<tr class="' + n + '-tr breakdown-mobile first">' + this.buildTableBreakdownTags("th", "No. of Payments", a) + this.buildTableBreakdownTags("td", s.numberOfPayments, a) + "</tr>", o += '<tr class="' + n + '-tr breakdown-mobile">' + this.buildTableBreakdownTags("th", "Interest Rate", a) + this.buildTableBreakdownTags("td", Number(s.interestRatePercent).toFixed(3) + "%", a) + "</tr>", o += '<tr class="' + n + '-tr breakdown-mobile last">' + this.buildTableBreakdownTags("th", "Monthly Payment (P&I)", a) + this.buildTableBreakdownTags("td", A.stringBuilder("$" + l), a) + "</tr>";
                    }
                o += "</table>", r.innerHTML = o, t.appendChild(r);
            },
            handleBreakdownTableKeypress: function (t) {
                "Enter" !== t.key && " " !== t.key || t.stopPropagation();
            },
            buildTableBreakdownTags: function (t, e, a) {
                var r = "";
                "mobile" === a && (r = "breakdown-mobile");
                var n = "";
                switch (t) {
                    case "th":
                        n = '<th scope="col" class="rates-calculator-breakdown-table-th ' + r + '">' + e + "</th>";
                        break;
                    case "td":
                        n = '<td class="rates-calculator-breakdown-table-td ' + r + '">' + e + "</td>";
                }
                return n;
            },
            setupTooltipEventListeners: function (t, e) {
                t && (t.addEventListener("focus", this.openTooltip.bind(this, e)), t.addEventListener("mouseenter", this.openTooltip.bind(this, e)), t.addEventListener("mouseleave", this.closeTooltip.bind(this, e)), t.addEventListener("blur", this.closeTooltip.bind(this, e)));
            },
            openTooltip: function (t) {
                t.classList.remove("hidden");
            },
            closeTooltipOnKeyPress: function (t) {
                "Escape" === t.key && (t.preventDefault(), this.stateTooltipContent.classList.add("hidden"));
            },
            closeTooltip: function (t) {
                t.classList.add("hidden");
            },
            displayResults: function () {
                var t = document.getElementById(a(this.id, !1)),
                    e = {},
                    n = document.getElementById("summary");
                if (this.buildResults(t), n) switch (this.formData.loanpurpose.value) {
                    case "Purchase":
                        e = { summary: { "Loan Purpose": this.formData.loanpurpose.value, "Purchase Price": this.formData.purchaseprice.value, "Down Payment": this.formData.downpaymentamount.value } };
                        break;
                    case "Cash-Out Refinance":
                        e = { summary: { "Loan Purpose": this.formData.loanpurpose.value, "Cash Out Amount": this.formData["cash-outamount"].value, "Estimated Value": this.formData.estimatedvalue.value } };
                        break;
                    case "No Cash-Out Refinance":
                        e = { summary: { "Loan Purpose": this.formData.loanpurpose.value, "Estimated Value": this.formData.estimatedvalue.value, "Loan Amount": this.getLoanAmount() } };
                        break;
                    default:
                        e = { loanamount: this.getLoanAmount() };
                } else e = { loanamount: this.getLoanAmount() };
                this.setResults(e);
                var o = b();
                window.setTimeout(function () {
                    var t = $(a(this.id, !0)),
                        e = t.find("ul li");
                    t.find("ul").empty().append(e), C ? y(o) : C = p(o, this.id), r();
                }.bind(this));
            },
            buildResults: function (t) {
                var e = this,
                    a = this.tableData.filter(P),
                    r = e.buildResultsTable(a),
                    n = e.buildMobileResultsTable(a),
                    o = x.ul({ id: "rates-list-" + this.id, class: "rates-calculator-results" }),
                    i = x.div({ id: "rates-list-announcements-" + this.id, class: "rates-calculator-results-announcement", "aria-live": "assertive", "aria-atomic": "true" });
                $(t).append(i).append(o(r).append(o(n)));
            },
            createResultsAnnouncement: function (t) {
                $("#rates-list-announcements-" + this.id).html(t);
            },
            clearResultsAnnouncement: function () {
                this.createResultsAnnouncement("");
            },
            getDiscountPointData: function (t) {
                void 0 === t && (t = {});
                var e = (t.points || 0 === t.points) && t.points.toFixed(3) || "",
                    a = " points",
                    r = t.discountPointsData || {};
                return r.BorPaidAmount ? (a = " discount points", e = MortgageCalculatorUtils.formatNumbers(r.BorPaidAmount.toFixed(2), 2, !0), e = "$" + e) : r.Amount && (a = " lender credit", e = MortgageCalculatorUtils.formatNumbers(r.Amount.toFixed(2), 2, !0), e = "-$" + e), { points: e, pointsText: a };
            },
            shouldHideDiscountPoints: function () {
                var t = e(),
                    a = MortgageCalculatorUtils.isEPCPPE() ? t.pricingEngineProviders.PPE[t.productPricingProvider] : t.pricingEngineProviders[t.productPricingProvider];
                if (a) return a.hideDiscountPoints;
            },
            groupResultsBy: function (t, e) {
                return t.reduce(function (t, a) {
                    var r = a[e];
                    return t[r] || (t[r] = []), t[r].push(a), t;
                }, {});
            },
            buildResultsTable: function (t) {
                var e = "",
                    a = "",
                    r = [],
                    n = this.groupResultsBy(t, "term"),
                    o = this.shouldHideDiscountPoints(),
                    i = this;
                return Object.keys(n).forEach(function (t) {
                    for (var s = n[t][0].term + " rates result table", l = o ? "" : '<th scope="col" class="rates-calculator-results-th">Points</th>', u = n[t][0].term, c = '<div class="rates-calculator-results-table-title">' + u + "</div>", d = '<table class="rates-calculator-results-table" summary="' + s + '"><tr class="rates-calculator-results-tr"><th scope="col" class="rates-calculator-results-th">Rate</th><th scope="col" class="rates-calculator-results-th">APR</th>' + l + "</tr>", m = 0; m < n[t].length; m++) {
                        var h = n[t][m],
                            g = 2,
                            p = Number(h.rate).toFixed(3) + "%",
                            f = Number(h.apr).toFixed(3) + "%";
                        if (a += '<tr class="rates-calculator-results-tr"><td class="rates-calculator-results-td td-big">' + p + '</td><td class="rates-calculator-results-td td-big">' + f + "</td>", !o) {
                            g++;
                            var v = i.getDiscountPointData(h),
                                y = v.points;
                            a += '<td class="rates-calculator-results-td td-small">' + y + "</td>";
                        }
                        var b = h.rateId,
                            P = h.programId || "",
                            w = h.loanId,
                            T = h.productGroupId || "",
                            R = "rates-calculator-breakdown-table-description-" + h.id,
                            M = i.getPaymentDetailsText(R);
                        a += "</tr>", a += '<tr class="rates-calculator-results-tr"><td colSpan="' + g + '" class="rates-calculator-results-td payment"><div data-rate-id="' + b + '" data-program-id="' + P + '" data-loan-id="' + w + '" data-product-group-id="' + T + '" data-testid="rates-calculator-results-payment-wrapper" class="rates-calculator-results-payment-wrapper"><div role="button" tabindex="0" aria-expanded="false" aria-label="Payment details for \'' + u + "' program having rate as '" + p + "' and APR as '" + f + '\'" data-testid="rates-calculator-breakdown-accordion" class="rates-calculator-results-payment" onclick="RatesCalculator.toggleRatesDetailsAccordion(event, \'desktop\')" onkeydown="RatesCalculator.handleAccordionKeypress(event, \'desktop\')">' + M[0] + "</div>" + M[1] + "</div></td></tr>";
                    }
                    e = c + d + a + "</table>", r.push(x.div({ class: "rates-calculator-result-term" })(e)), a = "";
                }), x.li({ class: "rates-calculator-result" })(r);
            },
            getPaymentDetailsText: function (t) {
                var e = "rates-calculator-payments-details";
                return ['<span data-testid="' + e + '-arrow-payment" class="' + e + '-arrow-payment"></span><span></span>Payment Details', '<div data-testid="' + e + '" id="' + t + '" class="' + e + '">Proposed monthly principal & interest payment schedule</div>'];
            },
            handleAccordionKeypress: function (t, e) {
                "Enter" !== t.key && " " !== t.key || (t.preventDefault(), RatesCalculator.toggleRatesDetailsAccordion(t, e));
            },
            buildMobileResultsTable: function (t) {
                var e = "",
                    a = "",
                    r = [],
                    n = this.groupResultsBy(t, "term"),
                    o = this.shouldHideDiscountPoints(),
                    i = this;
                return Object.keys(n).forEach(function (t) {
                    for (var s = n[t][0].term + " rates result table", l = '<div class="rates-calculator-results-mobile-table-title">' + n[t][0].term + "</div>", u = '<table class="rates-calculator-results-mobile-table" summary="' + s + '">', c = 0; c < n[t].length; c++) {
                        var d = n[t][c],
                            m = c % 2 == 1 ? "rates-calculator-results-mobile-odd-tr" : "rates-calculator-results-mobile-even-tr";
                        if (a += '<tr class="' + m + ' top"><th scope="row" class="rates-calculator-results-th th-big">Rate</th><td class="rates-calculator-results-td td-big">' + Number(d.rate).toFixed(3) + '%</td></tr><tr class="' + m + '"><th scope="row" class="rates-calculator-results-th th-big">APR</th><td class="rates-calculator-results-td td-big">' + Number(d.apr).toFixed(3) + "%</td></tr>", !o) {
                            var h = i.getDiscountPointData(d);
                            a += '<tr class="' + m + ' bottom"><th scope="row" class="rates-calculator-results-th th-small">Points</th><td class="rates-calculator-results-td td-small">' + h.points + "</td></tr>";
                        }
                        var g = d.rateId,
                            p = d.programId || "",
                            f = d.productGroupId || "",
                            v = d.loanId,
                            y = "rates-calculator-breakdown-table-description-" + d.id,
                            b = i.getPaymentDetailsText(y);
                        a += '<tr class="' + m + '"><td class="rates-calculator-results-td payment mobile" colspan="2"><div data-rate-id="' + g + '" data-program-id="' + p + '" data-loan-id="' + v + '" data-product-group-id="' + f + '" data-testid="rates-calculator-results-payment-wrapper" class="rates-calculator-results-payment-wrapper"><div class="rates-calculator-results-payment" onClick="RatesCalculator.toggleRatesDetailsAccordion(event, \'mobile\')">' + b[0] + "</div>" + b[1] + "</div></td></tr>";
                    }
                    e = u + l + a + "</table>", r.push(x.div({ class: "rates-calculator-result-term" })(e)), a = "";
                }), x.li({ class: "rates-calculator-result" })(r);
            },
            buildPagination: function (t) {
                o(), R = h(this.id, t), $(a(this.id, !0)).after(R);
            },
            getRates: function () {
                var t = this.getApiRequestBody(),
                    e = this,
                    a = function (a) {
                        $.ajax({
                            method: "POST",
                            url: e.ratesApiUrl + "?include=products&siteId=site:" + e.siteId,
                            data: JSON.stringify(t),
                            contentType: "application/json",
                            headers: {
                                Authorization: "Bearer " + a
                            },
                            success: function (t) {
                                e.retryAttempted = !1, t.Aprs && t.Aprs.length && 0 !== t.NumberOfLoanPrograms ? (e.tableData = e.getLoanProgramViewModels(t.Aprs), D = e.tableData.length, e.getAllLoanProgramDetails(0)) : (e.setResults({
                                    noresults: [e.noRatesMessageHeader, e.noRatesMessageBody]
                                }), e.disableForm(!1));
                            },
                            error: function (t) {
                                t && 401 === t.status && !e.retryAttempted ? (e.clearToken(), e.retryAttempted = !0, e.getRates()) : (e.retryAttempted = !1, e.disableForm(!1), e.setResults({
                                    noresults: [e.noRatesMessageHeader, e.noRatesMessageBody]
                                }));
                            }
                        });
                    };
                this.resetRates(), this.disableForm(!0), this.getToken(function (t) {
                    a(t);
                });
            },
            getLoanProgramViewModels: function (t) {
                for (var e = [], a = 0; a < t.length; a++) {
                    var r = t[a],
                        n = r.MortgageRateList[0],
                        o = T(n),
                        i = n ? n.LoanId : "",
                        s = "Loan" + i + (r.ProductGroupID ? "ProductGroup" + r.ProductGroupID : "Program" + r.ProgramID);
                    e.push({
                        id: s,
                        term: o,
                        loanId: i,
                        productGroupId: r.ProductGroupID,
                        programId: r.ProgramID,
                        isFullyLoaded: !1,
                        isRootProgramRecord: !0
                    });
                }
                return e;
            },
            getRateViewModels: function (t) {
                for (var e = [], a = 0; a < t.length; a++)
                    for (var r = 0; r < t[a].MortgageRateList.length; r++) {
                        var n = t[a].MortgageRateList[r],
                            o = n.ClosingCostContract.Gfe2010.Gfe2010Fees.filter(function (t) {
                                return "Section800LOCompensation" === t.Gfe2010FeeParentType;
                            }),
                            i = "Loan" + n.LoanId + (n.ProductGroupID ? "ProductGroup" + n.ProductGroupID : "Program" + n.ProgramID);
                        e.push({
                            id: i,
                            rateId: n.Id,
                            loanId: n.LoanId,
                            productGroupId: n.ProductGroupID,
                            programId: n.ProgramID,
                            term: T(n),
                            apr: n.APR,
                            rate: n.Rate,
                            payment: n.MonthlyPayment,
                            points: n.Points,
                            isFullyLoaded: !0,
                            isChildProgramRecord: !0,
                            discountPointsData: o[0]
                        });
                    }
                return e;
            },
            getToken: function (t) {
                var e = this,
                    a = function (e) {
                        "function" == typeof t && t(e);
                    };
                if (this.token) return void a(this.token);
                var r = ["grant_type=client_credentials", "scope=" + encodeURIComponent("ccbp cc")];
                return $.ajax({
                    method: "POST",
                    url: this.tokenApiUrl,
                    data: r.join("&"),
                    headers: {
                        Authorization: "Basic OHNyeXFkc3k6Rm1iVjh0YnNUVlZDZVlVVkdPa0g3empSQW9HRjM1Vnp1TFhDb2pvZlcySHg4RmJKempreUJWZDk2U3h1dzBoUA==",
                        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
                    },
                    success: function (t) {
                        e.token = t.access_token, a(e.token);
                    },
                    error: function () {
                        e.setResults({
                            error: e.errorMessage
                        });
                    }
                });
            },
            clearToken: function () {
                this.token = null;
            },
            getLoanAppSettings: function () {
                var t = this;
                $.ajax({
                    method: "GET",
                    url: this.widgetApiUrl,
                    headers: {
                        Authorization: "Bearer " + this.token
                    },
                    success: function (t) {
                        console.log(t);
                    },
                    error: function (e) {
                        t.setResults({
                            error: t.errorMessage
                        });
                    }
                });
            },
            getAllLoanProgramDetails: n,
            removeLoanFromResults: function (t) {
                var e = this.getIndexOfLoan(t);
                this.tableData.splice(e, 1);
            },
            getIndexOfLoan: function (t) {
                for (var e = 0; e < this.tableData.length; e++)
                    if (this.tableData[e].id === t) return e;
                return this.tableData.length;
            },
            addRatesToResults: function (t) {
                var e = this.getIndexOfFirstIncompleteRate();
                Array.prototype.splice.apply(this.tableData, [e, 0].concat(t));
            },
            getIndexOfFirstIncompleteRate: function () {
                for (var t = 0; t < this.tableData.length; t++)
                    if (void 0 === this.tableData[t].apr) return t;
                return this.tableData.length;
            },
            getLoanAmount: function () {
                return "Purchase" === this.formData.loanpurpose.value ? this.formData.purchaseprice.value - this.formData.downpaymentamount.value : this.formData.loanamount.value;
            },
            getApiRequestBody: function () {
                var t = this.ratesApiSettings || e(),
                    a = {};
                RatesFieldMapping ? a = RatesFieldMapping.config.mappings : console.error("Unable to find rate field mapping json");
                var r = function (t) {
                    return "Detached-Single" === t || "Detached-Multi" === t ? "Detached" : t;
                },
                    n = {
                        LoanPurpose: this.formData.loanpurpose.value,
                        LoanType: function (t) {
                            return (MortgageCalculatorUtils.isEPCPPE() ? t.pricingEngineProviders.PPE[t.productPricingProvider] : t.pricingEngineProviders[t.productPricingProvider]).loanTypes.filter(function (t) {
                                return t.enabled;
                            }).map(function (t) {
                                return "USDA-RHS" === t.name ? "FarmersHomeAdministration" : t.name;
                            }).join(",");
                        }(t),
                        PropertyUsage: this.formData.propertyusage.value,
                        PropertyType: this.formData.propertytype.value,
                        SubjectPropertyZip: this.formData.zipcode.value,
                        SubjectPropertyState: this.formData.state.value,
                        BorrowerBaseIncome: +this.formData.annualincome.value - 12 * this.formData.monthlydebt.value,
                        Representativecreditscore: this.formData.creditscore.value,
                        AmortizationType: this.formData.amortizationtype.value,
                        NumberOfUnits: function (t, e) {
                            var a = 1;
                            return e.numberofunits && e.numberofunits.value && !e.numberofunits.isHidden ? a = parseInt(e.numberofunits.value) : "2+ Units" === t && (a = 2), a;
                        }(this.formData.propertytype.value, this.formData)
                    };
                return $.extend(!0, n, function (e) {
                    var n = e.loanpurpose.value,
                        o = e.propertyusage.value,
                        i = e.creditscore.value,
                        s = e.amortizationtype.value,
                        l = e.propertytype.text,
                        u = {},
                        c = t.pricingEngineProviders.PPE,
                        d = !!c && c[t.productPricingProvider];
                    switch (n) {
                        case "Purchase":
                            u.PurchasePrice = +e.purchaseprice.value, u.BorrowerRequestedLoanAmount = u.PurchasePrice - e.downpaymentamount.value;
                            break;
                        case "Cash-Out Refinance":
                            u.CashoutAmount = +e["cash-outamount"].value, u.EstimatedValue = +e.estimatedvalue.value, u.BorrowerRequestedLoanAmount = +e.loanamount.value;
                            break;
                        case "No Cash-Out Refinance":
                            u.LoanPurpose = "NoCash-Out Refinance", u.EstimatedValue = +e.estimatedvalue.value, u.BorrowerRequestedLoanAmount = +e.loanamount.value;
                    }
                    if (d ? (u.PropertyUsage = a.PropertyUsage[o][EPC], u.Representativecreditscore = a.Representativecreditscore[i][EPC], u.AmortizationType = a.AmortizationType[s][EPC], u.PropertyType = r(a.PropertyType[l][EPC]), "Detached-Single" === u.PropertyType && (u.PropertyType = "Detached")) : (u.PropertyUsage = a.PropertyUsage[o][t.productPricingProvider], u.Representativecreditscore = a.Representativecreditscore[i][t.productPricingProvider], u.AmortizationType = a.AmortizationType[s][t.productPricingProvider], u.PropertyType = a.PropertyType[l][t.productPricingProvider]), w()) "ManufacturedHousingMultiwide" === u.PropertyType && (u.PropertyType = "ManufacturedHousing");
                    else {
                        var m = d ? a.NonEppsFieldPostPayload[EPC] : a.NonEppsFieldPostPayload[t.productPricingProvider];
                        Object.keys(m).forEach(function (t) {
                            var a = "";
                            if (m[t].formValue.hasOwnProperty("mapToFormKey")) {
                                var r = m[t].formValue.mapToFormKey,
                                    n = m[t].formValue.hasOwnProperty("type") ? m[t].formValue.type : "string";
                                if (e[r]) switch (n) {
                                    case "number":
                                        a = +e[r].value;
                                        break;
                                    case "boolean":
                                        a = Boolean(e[r].value);
                                        break;
                                    default:
                                        a = e[r].value;
                                }
                            } else a = m[t].formValue;
                            u[t] = a;
                        });
                    }
                    return u;
                }(this.formData)), n;
            },
            disableForm: function (t) {
                var e = document.getElementById("mortgage-calculators-widget-form-js-" + this.id);
                if (e) {
                    for (var a = e.elements, r = 0, n = a.length; r < n; ++r) a[r].disabled = t;
                    l("disabled", t);
                }
            },
            lookupCounty: t.bind(this),
            showHideDependentFields: function () {
                var t = document.querySelectorAll("input[name=type][value=Rates]");
                for (i = 0; i < t.length; i++) {
                    var e = t[i];
                    if (e && e.form) {
                        for (var a = e.form.querySelectorAll("input[data-parent-options]"), r = [], n = 0; n < a.length; n++)
                            if (a[n].dataset.hasOwnProperty("parentOptions")) {
                                var o = a[n].dataset.parent.replace(/ /g, "").toLowerCase();
                                r.indexOf(o) < 0 && r.push(o);
                            }
                        for (var s = 0; s < r.length; s++) {
                            const l = new Event("change"),
                                u = document.querySelector('[name="' + r[s] + '"]');
                            u && u.dispatchEvent(l);
                        }
                    }
                }
            }
        };
    return O;
}();
RatesCalculator.init();


function getRates() {
    var t = this.getApiRequestBody(),
        e = this,
        a = function (a) {
            $.ajax({
                method: "POST",
                url: e.ratesApiUrl + "?include=products&siteId=site:" + e.siteId,
                data: JSON.stringify(t),
                contentType: "application/json",
                headers: {
                    Authorization: "Bearer " + a
                },
                success: function (t) {
                    e.retryAttempted = !1, t.Aprs && t.Aprs.length && 0 !== t.NumberOfLoanPrograms ? (e.tableData = e.getLoanProgramViewModels(t.Aprs), D = e.tableData.length, e.getAllLoanProgramDetails(0)) : (e.setResults({
                        noresults: [e.noRatesMessageHeader, e.noRatesMessageBody]
                    }), e.disableForm(!1))
                },
                error: function (t) {
                    t && 401 === t.status && !e.retryAttempted ? (e.clearToken(), e.retryAttempted = !0, e.getRates()) : (e.retryAttempted = !1, e.disableForm(!1), e.setResults({
                        noresults: [e.noRatesMessageHeader, e.noRatesMessageBody]
                    }))
                }
            })
        };
    this.resetRates(), this.disableForm(!0), this.getToken(function (t) {
        a(t)
    })
}

function getLoanProgramViewModels(t) {
    for (var e = [], a = 0; a < t.length; a++) {
        var r = t[a],
            n = r.MortgageRateList[0],
            o = T(n),
            i = n ? n.LoanId : "",
            s = "Loan" + i + (r.ProductGroupID ? "ProductGroup" + r.ProductGroupID : "Program" + r.ProgramID);
        e.push({
            id: s,
            term: o,
            loanId: i,
            productGroupId: r.ProductGroupID,
            programId: r.ProgramID,
            isFullyLoaded: !1,
            isRootProgramRecord: !0
        })
    }
    return e
}

function getRateViewModels(t) {
    for (var e = [], a = 0; a < t.length; a++)
        for (var r = 0; r < t[a].MortgageRateList.length; r++) {
            var n = t[a].MortgageRateList[r],
                o = n.ClosingCostContract.Gfe2010.Gfe2010Fees.filter(function (t) {
                    return "Section800LOCompensation" === t.Gfe2010FeeParentType
                }),
                i = "Loan" + n.LoanId + (n.ProductGroupID ? "ProductGroup" + n.ProductGroupID : "Program" + n.ProgramID);
            e.push({
                id: i,
                rateId: n.Id,
                loanId: n.LoanId,
                productGroupId: n.ProductGroupID,
                programId: n.ProgramID,
                term: T(n),
                apr: n.APR,
                rate: n.Rate,
                payment: n.MonthlyPayment,
                points: n.Points,
                isFullyLoaded: !0,
                isChildProgramRecord: !0,
                discountPointsData: o[0]
            })
        }
    return e
}

function getToken(t) {
    var e = this,
        a = function (e) {
            "function" == typeof t && t(e)
        };
    if (this.token) return void a(this.token);
    var r = ["grant_type=client_credentials", "scope=" + encodeURIComponent("ccbp cc")];
    return $.ajax({
        method: "POST",
        url: this.tokenApiUrl,
        data: r.join("&"),
        headers: {
            Authorization: "Basic OHNyeXFkc3k6Rm1iVjh0YnNUVlZDZVlVVkdPa0g3empSQW9HRjM1Vnp1TFhDb2pvZlcySHg4RmJKempreUJWZDk2U3h1dzBoUA==",
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
        },
        success: function (t) {
            e.token = t.access_token, a(e.token)
        },
        error: function () {
            e.setResults({
                error: e.errorMessage
            })
        }
    })
}

function clearToken() {
    this.token = null
}

function getLoanAppSettings() {
    var t = this;
    $.ajax({
        method: "GET",
        url: this.widgetApiUrl,
        headers: {
            Authorization: "Bearer " + this.token
        },
        success: function (t) {
            console.log(t)
        },
        error: function (e) {
            t.setResults({
                error: t.errorMessage
            })
        }
    })
}

function getAllLoanProgramDetails(n) {
    // ... existing code ...
}

function removeLoanFromResults(t) {
    var e = this.getIndexOfLoan(t);
    this.tableData.splice(e, 1)
}

function getIndexOfLoan(t) {
    for (var e = 0; e < this.tableData.length; e++)
        if (this.tableData[e].id === t) return e;
    return this.tableData.length
}

function addRatesToResults(t) {
    var e = this.getIndexOfFirstIncompleteRate();
    Array.prototype.splice.apply(this.tableData, [e, 0].concat(t))
}

function getIndexOfFirstIncompleteRate() {
    for (var t = 0; t < this.tableData.length; t++)
        if (void 0 === this.tableData[t].apr) return t;
    return this.tableData.length
}

function getLoanAmount() {
    return "Purchase" === this.formData.loanpurpose.value ? this.formData.purchaseprice.value - this.formData.downpaymentamount.value : this.formData.loanamount.value
}

function getApiRequestBody() {
    var t = this.ratesApiSettings || e(),
        a = {};
    RatesFieldMapping ? a = RatesFieldMapping.config.mappings : console.error("Unable to find rate field mapping json");
    var r = function (t) {
        return "Detached-Single" === t || "Detached-Multi" === t ? "Detached" : t
    },
        n = {
            LoanPurpose: this.formData.loanpurpose.value,
            LoanType: function (t) {
                return (MortgageCalculatorUtils.isEPCPPE() ? t.pricingEngineProviders.PPE[t.productPricingProvider] : t.pricingEngineProviders[t.productPricingProvider]).loanTypes.filter(function (t) {
                    return t.enabled
                }).map(function (t) {
                    return "USDA-RHS" === t.name ? "FarmersHomeAdministration" : t.name
                }).join(",")
            }(t),
            PropertyUsage: this.formData.propertyusage.value,
            PropertyType: this.formData.propertytype.value,
            SubjectPropertyZip: this.formData.zipcode.value,
            SubjectPropertyState: this.formData.state.value,
            BorrowerBaseIncome: +this.formData.annualincome.value - 12 * this.formData.monthlydebt.value,
            Representativecreditscore: this.formData.creditscore.value,
            AmortizationType: this.formData.amortizationtype.value,
            NumberOfUnits: function (t, e) {
                var a = 1;
                return e.numberofunits && e.numberofunits.value && !e.numberofunits.isHidden ? a = parseInt(e.numberofunits.value) : "2+ Units" === t && (a = 2), a
            }(this.formData.propertytype.value, this.formData)
        };
    return $.extend(!0, n, function (e) {
        var n = e.loanpurpose.value,
            o = e.propertyusage.value,
            i = e.creditscore.value,
            s = e.amortizationtype.value,
            l = e.propertytype.text,
            u = {},
            c = t.pricingEngineProviders.PPE,
            d = !!c && c[t.productPricingProvider];
        switch (n) {
            case "Purchase":
                u.PurchasePrice = +e.purchaseprice.value, u.BorrowerRequestedLoanAmount = u.PurchasePrice - e.downpaymentamount.value;
                break;
            case "Cash-Out Refinance":
                u.CashoutAmount = +e["cash-outamount"].value, u.EstimatedValue = +e.estimatedvalue.value, u.BorrowerRequestedLoanAmount = +e.loanamount.value;
                break;
            case "No Cash-Out Refinance":
                u.LoanPurpose = "NoCash-Out Refinance", u.EstimatedValue = +e.estimatedvalue.value, u.BorrowerRequestedLoanAmount = +e.loanamount.value
        }
        if (d ? (u.PropertyUsage = a.PropertyUsage[o][EPC], u.Representativecreditscore = a.Representativecreditscore[i][EPC], u.AmortizationType = a.AmortizationType[s][EPC], u.PropertyType = r(a.PropertyType[l][EPC]), "Detached-Single" === u.PropertyType && (u.PropertyType = "Detached")) : (u.PropertyUsage = a.PropertyUsage[o][t.productPricingProvider], u.Representativecreditscore = a.Representativecreditscore[i][t.productPricingProvider], u.AmortizationType = a.AmortizationType[s][t.productPricingProvider], u.PropertyType = a.PropertyType[l][t.productPricingProvider]), w()) "ManufacturedHousingMultiwide" === u.PropertyType && (u.PropertyType = "ManufacturedHousing");
        else {
            var m = d ? a.NonEppsFieldPostPayload[EPC] : a.NonEppsFieldPostPayload[t.productPricingProvider];
            Object.keys(m).forEach(function (t) {
                var a = "";
                if (m[t].formValue.hasOwnProperty("mapToFormKey")) {
                    var r = m[t].formValue.mapToFormKey,
                        n = m[t].formValue.hasOwnProperty("type") ? m[t].formValue.type : "string";
                    if (e[r]) switch (n) {
                        case "number":
                            a = +e[r].value;
                            break;
                        case "boolean":
                            a = Boolean(e[r].value);
                            break;
                        default:
                            a = e[r].value
                    }
                } else a = m[t].formValue;
                u[t] = a
            })
        }
        return u
    }(this.formData)), n
}

function disableForm(t) {
    var e = document.getElementById("mortgage-calculators-widget-form-js-" + this.id);
    if (e) {
        for (var a = e.elements, r = 0, n = a.length; r < n; ++r) a[r].disabled = t;
        l("disabled", t)
    }
}

function lookupCounty(t) {
    // ... existing code ...
}

function showHideDependentFields() {
    var t = document.querySelectorAll("input[name=type][value=Rates]");
    for (i = 0; i < t.length; i++) {
        var e = t[i];
        if (e && e.form) {
            for (var a = e.form.querySelectorAll("input[data-parent-options]"), r = [], n = 0; n < a.length; n++)
                if (a[n].dataset.hasOwnProperty("parentOptions")) {
                    var o = a[n].dataset.parent.replace(/ /g, "").toLowerCase();
                    r.indexOf(o) < 0 && r.push(o)
                }
            for (var s = 0; s < r.length; s++) {
                const l = new Event("change"),
                    u = document.querySelector('[name="' + r[s] + '"]');
                u && u.dispatchEvent(l)
            }
        }
    }
}