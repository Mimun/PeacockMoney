const CronJob = require('cron').CronJob
module.exports = class PeriodRecord {
  constructor(object) {
    for (var prop in object) {
      this[prop] = object[prop]
    }
    // this.appliedRule = this.appliedRule ? this.appliedRule : null
    // this.penalty = this.penalty ? this.penalty : 0
    // this.blockPenalty = this.blockPenalty ? this.blockPenalty : 0
    // this.totalPenalty = this.totalPenalty ? this.totalPenalty : this.penalty + this.blockPenalty
    // this.penaltyRecord = this.penaltyRecord ? this.penaltyRecord : []
    // this.paymentRecords = this.paymentRecords ? this.paymentRecords : []
    // this.totalPayment = this.totalPayment ? this.totalPayment : this.redemption + this.blockPenalty + this.penalty
    // this.paid = this.paid ? this.paid : 0
    // this.remain = this.remain ? this.remain : this.totalPayment - this.paid
    // this.payDown = this.payDown ? this.payDown : 0
    // this.loanMore = this.loanMore ? this.loanMore : 0
    // this.isPause = this.isPause ? this.isPause : false
    // this.numericalOrder = this.numericalOrder ? this.numericalOrder : this.period + 1
    // this.isLoanMorePeriod = this.isLoanMorePeriod ? this.isLoanMorePeriod : false
    // this.isPaydownPeriod = this.isPaydownPeriod ? this.isPaydownPeriod : false
    return this

  }

  // count(days) {
  //   // 5 seconds = 1 day
  //   this.countInterval = setInterval(() => {
  //     if (!this.isPause) {
  //       // calculate days between real life date and redemption date
  //       this.realLifeDate.setDate(this.realLifeDate.getDate() + 1)
  //       console.log('real life date in record: ', this.realLifeDate)
  //       this.calculateDaysBetween()
  //       this.updatePeriodTable('period-table-container', this.period, 'daysBetween', this.daysBetween)
  //       // check rule
  //       this.checkRule()
  //       console.log(`days between of period ${this.period}: ${this.daysBetween}\n<--------------->`)

  //       if (this.periodStatus) {
  //         clearInterval(this.countInterval)
  //       }
  //     }

  //   }, 2000)
  // }

  count(date) {
    console.log('count in period record: ', this.realLifeDate)
    this.calculateDaysBetween()
    // check rule
    // this.realLifeDate.setDate(this.realLifeDate.getDate() + 1)
    this.realLifeDate = new Date(date)
    this.checkRule()
    if (this.periodStatus) {
      clearInterval(this.countInterval)
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

