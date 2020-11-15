module.exports = class PeriodRecord {
  constructor(object) {
    for (var prop in object) {
      this[prop] = object[prop]
    }
    this.realLifeDate = new Date(this.realLifeDate)
    this.redemptionDate = new Date(this.redemptionDate)
    this.periodStartDate = new Date(this.periodStartDate)
    this.periodEndDate = new Date(this.periodEndDate)
    return this

  }

  count(date) {
    if (this.periodStatus === false) {
      this.realLifeDate = new Date(date)
      this.calculateDaysBetween()
      this.checkRule()
    }

  }

  stopCounting() {
    clearInterval(this.countInterval)
  }

  pauseCounting() {
    this.isPause = !this.isPause
  }

  calculateDaysBetween() {
    var oneDay = 1000 * 60 * 60 * 24
    var msDifference = this.realLifeDate.getTime() - this.redemptionDate.getTime()
    this.daysBetween = msDifference / oneDay

  }

  checkRule() {
    console.log('this original value: ', this.presentValue)

    this.ruleArray.filter(rule => {
      var debtFrom = rule.debtFrom === undefined || rule.debtFrom === null || rule.debtFrom === '' ? 0 : parseFloat(rule.debtFrom)
      var debtTo = rule.debtTo === undefined || rule.debtTo === null || rule.debtTo === '' ? 0 : parseFloat(rule.debtTo)
      console.log('debt from: ', debtFrom)
      console.log('debt to: ', debtTo)

      if ((debtTo - debtFrom) > 0 && debtFrom < this.presentValue && this.presentValue <= debtTo) {
        return rule
      } else if ((debtTo - debtFrom) < 0 && debtFrom < this.presentValue) {
        return rule
      } else if ((debtTo - debtFrom) === 0 && debtFrom !== 0 && debtTo !== 0 && debtFrom === this.presentValue) {
        return rule
      } else if ((debtTo - debtFrom) === 0 && debtFrom === 0 && debtTo === 0 && debtFrom !== this.presentValue) {
        return rule
      }
    }).filter(rule => {
      if (this.daysBetween === parseInt(rule.from)) {
        this.appliedRule = rule
      }
      // return daysBetween === parseInt(rule.from)
    })
    console.log('this applied rule: ', this.appliedRule)
    if (this.appliedRule) {
      switch (this.appliedRule.policyType) {
        case ('static'):
          this.applyStaticRule(this.appliedRule)
          this.appliedRule = null
          break
        // dynamic 1: based on time
        case ('dynamic1'):
          this.applyDynamic1Rule(this.appliedRule)
          break
        // dynamic 2: based on the amount of money that is Paid late
        case ('dynamic2'):
          this.applyDynamic2Rule(this.appliedRule)
          this.appliedRule = null
          break
        default:
      }
    }
  }

  applyStaticRule(appliedRule) {
    this.penaltyRecord.push({
      reason: 'penalty',
      policyType: 'static',
      value: parseFloat(appliedRule.penaltyRate),
      date: this.realLifeDate,
    })
    this.penalty = parseFloat(appliedRule.penaltyRate)
    this.totalPenalty = this.penalty + this.blockPenalty
    this.totalPayment = this.redemption + this.totalPenalty
    this.remain = this.totalPayment - this.paid

    console.log('applied static rule:', this.record)
  }

  // dynamic 1: based on late days
  applyDynamic1Rule(appliedRule) {
    this.penaltyRecord.push({
      reason: 'penalty',
      policyType: 'static',
      value: Math.round(parseFloat((appliedRule.penaltyRate * this.daysBetween * this.presentValue) / 100)),
      date: this.realLifeDate,
    })
    this.penalty = Math.round(parseFloat((appliedRule.penaltyRate * this.daysBetween * this.presentValue) / 100))
    this.totalPenalty = this.penalty + this.blockPenalty
    this.totalPayment = Math.round(this.redemption + this.totalPenalty)
    this.remain = this.totalPayment - this.paid

    console.log('applied static rule:', this.record)
  }

  // dynamic 2: based on late payments
  applyDynamic2Rule(appliedRule) {
    this.penalty = Math.round(parseFloat((appliedRule.penaltyRate * (this.redemption - this.paid)) / 100))
    this.totalPenalty = this.penalty + this.blockPenalty
    this.totalPayment = Math.round(this.redemption + this.totalPenalty)
    this.remain = this.totalPayment - this.paid
    this.penaltyRecord.push({
      reason: 'penalty',
      policyType: 'static',
      value: this.penalty,
      date: this.realLifeDate,
    })

    console.log('applied static rule:', this.record)
  }

  updatePeriodTable(elementName, period, updateElement, updateValue) {
    document.querySelector(`div.${elementName} table tbody tr[id='${period}'] th#${updateElement}`).innerHTML = updateValue.toLocaleString()
  }

  updateHistoryPayment(elementName, paidDate) {
    var tr = document.createElement('tr')
    document.querySelectorAll(`div.${elementName} table thead th`).forEach(element => {
      var th = document.createElement('th')
      th.innerHTML = element.id === "realLifeDate" ? paidDate : this[element.id].toLocaleString()
      tr.appendChild(th)
    })

    document.querySelector(`div.${elementName} table tbody`).appendChild(tr)

  }

  updateTotalPayment(interst, principal, redemption, presentValue, blockPenalty) {
    this.interest = interst
    this.principal = principal
    this.redemption = redemption
    this.blockPenalty = blockPenalty
    this.totalPenalty = this.penalty + this.blockPenalty
    this.totalPayment = this.redemption + this.totalPenalty
    this.paid = 0
    this.remain = this.totalPayment - this.paid
    // this.remain = 0

    this.presentValue = presentValue
    this.periodStatus = false
    this.checkEqual()
  }

  checkEqual() {
    if (this.remain < 0 || this.remain == 0) {
      this.periodStatus = true

    }
  }

}

