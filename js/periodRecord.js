export default class PeriodRecord {
  // period status: is done or not
  constructor(realLifeDate, redemptionDate, periodEndDate, redemption, periodStatus, period, ruleArray, originalValue) {
    this.realLifeDate = new Date(realLifeDate)
    this.daysBetween = 0
    this.originalValue = originalValue

    this.ruleArray = ruleArray
    this.appliedRule = null

    this.period = period
    this.periodStatus = periodStatus
    this.penaltyRecord = []
    this.paymentRecords = []
    this.redemptionDate = new Date(redemptionDate)
    this.periodEndDate = periodEndDate
    this.redemption = redemption
    this.totalPayment = this.redemption
    this.payed = 0
    this.remain = this.redemption
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
            // dynamic 2: based on the amount of money that is payed late
            case ('dynamic2'):
              this.applyDynamic2Rule(this.appliedRule)
              this.appliedRule = null
              break
            default:
          }
        }

        if (this.periodStatus) {
          clearInterval(this.countInterval)
        }
      }

    }, 5000)
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
  checkRule(){
    this.ruleArray.filter(rule => {
      var debtFrom = rule.debtFrom === undefined || rule.debtFrom === null || rule.debtFrom === '' ? 0 : parseFloat(rule.debtFrom)
      var debtTo = rule.debtTo === undefined || rule.debtTo === null || rule.debtTo === '' ? 0 : parseFloat(rule.debtTo)
      if ((debtTo - debtFrom) >= 0 && debtFrom < this.originalValue && this.originalValue <= debtTo) {
        console.log('applied 1')
        return rule
      } else if ((debtTo - debtFrom) < 0 && debtFrom < this.originalValue) {
        console.log('applied 2')
        return rule
      }
    }).filter(rule=>{
      if(this.daysBetween === parseInt(rule.from)){
        this.appliedRule = rule
      }
      // return daysBetween === parseInt(rule.from)
    })
  }

  applyStaticRule(appliedRule) {
    this.penaltyRecord.push({
      reason: 'penalty',
      policyType: 'static',
      value: parseFloat(appliedRule.penaltyRate),
      date: this.realLifeDate,
    })

    this.totalPayment = this.redemption + parseFloat(appliedRule.penaltyRate)
    this.remain = this.totalPayment - this.payed
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
    this.remain = this.totalPayment - this.payed
    this.updatePeriodTable('period-table-container', this.period, 'totalPayment', this.totalPayment.toLocaleString())
    this.updatePeriodTable('period-table-container', this.period, 'remain', this.remain.toLocaleString())

    console.log('applied static rule:', this.record)
  }

  // dynamic 2: based on late payments
  applyDynamic2Rule(appliedRule) {
    this.totalPayment = this.redemption +
      parseFloat((appliedRule.penaltyRate * (this.redemption - this.payed)) / 100)

    this.remain = this.totalPayment - this.payed
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

  updateHistoryPayment(elementName, payedDate) {
    var tr = document.createElement('tr')
    document.querySelectorAll(`div.${elementName} table thead th`).forEach(element => {
      var th = document.createElement('th')
      th.innerHTML = element.id === "realLifeDate" ? payedDate : this[element.id].toLocaleString()
      tr.appendChild(th)
    })

    document.querySelector(`div.${elementName} table tbody`).appendChild(tr)

  }
}

