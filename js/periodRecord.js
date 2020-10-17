export default class PeriodRecord {
  // period status: is done or not
  // period, redemptionDate, redemption, principal, incrementalPaidPrincipal, interest, accumulatedPaidInterest,
  // periodEndDate, periodStatus, ruleArray, originalValue, realLifeDate
  constructor(period, redemptionDate, redemption, principal, incrementalPaidPrincipal, interest, accumulatedPaidInterest,
    periodEndDate, periodStatus, ruleArray, originalValue, realLifeDate) {
    this.period = period
    this.redemptionDate = new Date(redemptionDate)
    this.redemption = redemption
    this.principal = principal
    this.incrementalPaidPrincipal = incrementalPaidPrincipal
    this.interest = interest
    this.accumulatedPaidInterest = accumulatedPaidInterest

    this.periodEndDate = periodEndDate
    this.periodStatus = periodStatus
    this.ruleArray = ruleArray
    this.originalValue = originalValue
    this.realLifeDate = new Date(realLifeDate)

    this.totalPayment = this.redemption
    this.paid = 0
    this.remain = this.redemption

    this.daysBetween = 0
    this.appliedRule = null
    this.penaltyRecord = []
    this.paymentRecords = []
   
    this.isPause = false
    // this.record = record
    this.countInterval = () => { }
  }

  count(days) {
    // 5 seconds = 1 day
    this.countInterval = setInterval(() => {
      if (!this.isPause) {
        // calculate days between real life date and redemption date
        this.realLifeDate.setDate(this.realLifeDate.getDate() + 1)
        console.log('real life date in record: ', this.realLifeDate)
        this.calculateDaysBetween()
        this.updatePeriodTable('period-table-container', this.period, 'counter', this.daysBetween)
        // check rule
        this.checkRule()
        console.log(`days between of period ${this.period}: ${this.daysBetween}\n<--------------->`)


        if (this.periodStatus) {
          clearInterval(this.countInterval)
        }
      }

    }, 2000)
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

  // checkRule() {
  //   this.ruleArray.filter(rule => {
  //     var debtFrom = rule.debtFrom && rule.debtFrom !== 0 && rule.debtFrom !== '' ? parseFloat(rule.debtFrom) : 0
  //     var debtTo = rule.debtTo && rule.debtTo !== 0 && rule.debtTo !== '' ? parseFloat(rule.debtTo) : 0
  //     if (debtTo !== 0 && this.originalValue <= debtTo && this.daysBetween === parseInt(rule.from)) {
  //       this.appliedRule = rule
  //       console.log('this.appliedRule 1: ', this.appliedRule)

  //     } else if (debtFrom !== 0 && this.originalValue > debtFrom && this.daysBetween === parseInt(rule.from)) {
  //       this.appliedRule = rule
  //       console.log('this.appliedRule 2: ', this.appliedRule)


  //     } else if (this.daysBetween === parseInt(rule.from)) {
  //       this.appliedRule = rule
  //       console.log('this.appliedRule 3: ', this.appliedRule)
  //     }
  //   })
  // }
  checkRule() {
    console.log('this original value: ', this.originalValue)

    this.ruleArray.filter(rule => {
      var debtFrom = rule.debtFrom === undefined || rule.debtFrom === null || rule.debtFrom === '' ? 0 : parseFloat(rule.debtFrom)
      var debtTo = rule.debtTo === undefined || rule.debtTo === null || rule.debtTo === '' ? 0 : parseFloat(rule.debtTo)
      console.log('debt from: ', debtFrom)
      console.log('debt to: ', debtTo)

      if ((debtTo - debtFrom) > 0 && debtFrom < this.originalValue && this.originalValue <= debtTo) {
        return rule
      } else if ((debtTo - debtFrom) < 0 && debtFrom < this.originalValue) {
        return rule
      } else if ((debtTo - debtFrom) === 0 && debtFrom !== 0 && debtTo !== 0 && debtFrom === this.originalValue) {
        return rule
      } else if ((debtTo - debtFrom) === 0 && debtFrom === 0 && debtTo === 0 && debtFrom !== this.originalValue) {
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

    this.totalPayment = this.redemption + parseFloat(appliedRule.penaltyRate)
    this.remain = this.totalPayment - this.paid
    this.updatePeriodTable('period-table-container', this.period, 'totalPayment', this.totalPayment.toLocaleString())
    this.updatePeriodTable('period-table-container', this.period, 'remain', this.remain.toLocaleString())

    console.log('applied static rule:', this.record)
  }

  // dynamic 1: based on late days
  applyDynamic1Rule(appliedRule) {
    console.log('penalty rate: ', appliedRule.penaltyRate)
    console.log('days between: ', this.daysBetween)
    console.log('original value: ', this.originalValue)

    this.penaltyRecord.push({
      reason: 'penalty',
      policyType: 'static',
      value: parseFloat((appliedRule.penaltyRate * this.daysBetween * this.originalValue) / 100),
      date: this.realLifeDate,
    })

    this.totalPayment = this.redemption +
      parseFloat((appliedRule.penaltyRate * this.daysBetween * this.originalValue) / 100)
    this.remain = this.totalPayment - this.paid
    this.updatePeriodTable('period-table-container', this.period, 'totalPayment', this.totalPayment.toLocaleString())
    this.updatePeriodTable('period-table-container', this.period, 'remain', this.remain.toLocaleString())

    console.log('applied static rule:', this.record)
  }

  // dynamic 2: based on late payments
  applyDynamic2Rule(appliedRule) {
    this.totalPayment = this.redemption +
      parseFloat((appliedRule.penaltyRate * (this.redemption - this.paid)) / 100)

    this.remain = this.totalPayment - this.paid
    this.penaltyRecord.push({
      reason: 'penalty',
      policyType: 'static',
      value: parseFloat((appliedRule.penaltyRate * this.remain) / 100),
      date: this.realLifeDate,
    })
    this.updatePeriodTable('period-table-container', this.period, 'totalPayment', this.totalPayment.toLocaleString())
    this.updatePeriodTable('period-table-container', this.period, 'remain', this.remain.toLocaleString())

    console.log('applied static rule:', this.record)
  }

  updatePeriodTable(elementName, period, updateElement, updateValue) {
    document.querySelector(`div.${elementName} table tbody tr[id='${period}'] th#${updateElement}`).innerHTML = updateValue
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
}

