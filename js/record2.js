import PeriodRecord from './periodRecord2.js'
export default class Record {
  constructor(interestRate = 0, presentValue = 0, agreementDate = new Date(Date.now()),
    numberOfPeriods = 0, ruleArray = [], realLifeDate) {
    this.interestRate = interestRate
    this.presentValue = presentValue
    this.agreementDate = agreementDate
    this.numberOfPeriods = numberOfPeriods
    this.incrementalPaidPrincipal = 0
    this.accumulatedPaidInterest = 0
    this.remainOrigin = presentValue
    this.paymentSlip = []
    this.periodRecords = []
    this.balance = 0
    this.ruleArray = ruleArray

    this.realLifeDate = realLifeDate
    this.isPause = false
    this.currentPeriod = 0
  }

  updatePaymentRecord(period, obj) {
    this.periodRecords[period] = obj
  }

  updateBalance(amount) {
    this.balance += amount
  }

  paidNotDonePeriod(amount, paidDate, notDonePeriodArray) {
    this.balance += amount
    var i = 0
    const recursive = (balance, paidDate, notDonePeriod, record) => {
      if (balance > 0) {
        var updateObj = notDonePeriod
        console.log('update obj: ', updateObj)
        // enough money for total payment of that period
        var payment = balance <= updateObj.remain ? balance : updateObj.remain
        updateObj.paid = updateObj.paid + payment
        updateObj.remain = updateObj.remain - payment

        balance = balance - payment

        updateObj.paymentRecords.push({
          paid: payment,
          date: paidDate
        })
        record.updatePaymentRecord(updateObj.period, updateObj)
        updateObj.updatePeriodTable('period-table-container', updateObj.period, 'paid', updateObj.paid.toLocaleString())
        updateObj.updatePeriodTable('period-table-container', updateObj.period, 'remain', updateObj.remain.toLocaleString())
        updateObj.updateHistoryPayment('payment-history', paidDate)

        if (updateObj.remain === 0) {
          updateObj.periodStatus = true
          updateObj.penalty = 0
          this.presentValue = this.presentValue - updateObj.principal
          this.accumulatedPaidInterest += updateObj.interest
          this.incrementalPaidPrincipal += updateObj.principal
          this.updatePresentValue()
          updateObj.accumulatedPaidInterest = this.accumulatedPaidInterest
          updateObj.incrementalPaidPrincipal = this.incrementalPaidPrincipal

          updateObj.stopCounting()
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'periodStatus', updateObj.periodStatus)
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'accumulatedPaidInterest', updateObj.accumulatedPaidInterest.toLocaleString())
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'incrementalPaidPrincipal', updateObj.incrementalPaidPrincipal.toLocaleString())
          // updateObj.updatePeriodTable('period-table-container', updateObj.period, 'presentValue', updateObj.presentValue.toLocaleString())
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'penalty', '0')

        }

        console.log('record after paying: ', record)
        i++
        if (notDonePeriodArray[i]) {
          return recursive(balance, paidDate, notDonePeriodArray[i], record)

        } else {
          return balance
        }
      } else {
        return balance
      }
    }
    var balance = recursive(this.balance, paidDate, notDonePeriodArray[i], this)
    this.balance = balance

  }

  updatePresentValue() {
    this.periodRecords.forEach(rec => {
      rec.presentValue = this.presentValue
      rec.updatePeriodTable('period-table-container', rec.period, 'presentValue', rec.presentValue.toLocaleString())

    })
  }

  count(date) {
    this.realLifeDate = new Date(date)
    var period = 0
    var interval = setInterval(() => {
      if (!this.isPause) {
        this.currentPeriod = period
        if (this.realLifeDate.getTime() === (this.periodRecords[period].redemptionDate.getTime() - (1000 * 24 * 60 * 60))
          || this.realLifeDate.getTime() === this.periodRecords[period].redemptionDate.getTime()) {
          console.log('is equal')
          this.periodRecords[period].count()
          period++
        }
        this.realLifeDate.setDate(this.realLifeDate.getDate() + 1)
        document.querySelector('p#real-date-counter span').innerHTML = formatDate(this.realLifeDate)

      }
    }, 2000)

  }

  pauseCounting() {
    console.log('period from counting: ', this.currentPeriod)
    this.isPause = !this.isPause
    for (var i = 0; i <= this.currentPeriod; i++) {
      console.log('all counting periods: ', this.periodRecords[i])
      if (this.periodRecords[i]) {
        this.periodRecords[i].pauseCounting()
      }
    }

  }

  createPeriodRecordForRecord(periodRecord) {
    this.periodRecords.push(periodRecord)
  }

  getLastPeriodRedemptionDate() {
    return this.periodRecords.length !== 0 ? this.periodRecords[this.periodRecords.length - 1].redemptionDate : this.agreementDate
  }

  applyNewPeriodRecordArray(array) {
    this.periodRecords = []
    this.periodRecords = array
  }

  createPeriodRecords() {
    // var i = index !== 0 && index !== null && index !== undefined ? index : 0
    // numberOfPeriods = numberOfPeriods !== 0 && numberOfPeriods !== null && numberOfPeriods !== undefined ? numberOfPeriods : this.numberOfPeriods

    for (var i = 0; i < this.numberOfPeriods; i++) {
      var tempPeriodStartDate = new Date(this.agreementDate)
      var periodStartDate = tempPeriodStartDate.addMonths(i)

      var tempPeriodEndDate = new Date(this.agreementDate)
      var periodEndDate = tempPeriodEndDate.addMonths(i + 1)

      var redemptionDate = new Date(periodEndDate)
      var periodRecord = this.createPeriodRecord(redemptionDate, periodStartDate, periodEndDate,
        i, this.presentValue, this.numberOfPeriods)
      this.periodRecords.push(periodRecord)

    }
  }

  createPeriodRecord(redemptionDate, periodStartDate, periodEndDate, period, presentValue, numberOfPeriods, blockPenalty = 0) {
    var daysInMonth = Math.abs((periodEndDate - periodStartDate) / (1000 * 24 * 60 * 60))
    var { interest, principal, redemption } = this.calculate2(this.interestRate, daysInMonth, presentValue, numberOfPeriods)
    var periodRecord = new PeriodRecord(period, redemptionDate, redemption, principal, 0, interest,
      0, 0, false, periodStartDate, periodEndDate, this.ruleArray, this.presentValue, redemptionDate, blockPenalty)
    return periodRecord
  }

  calculate1(interestRate, daysInMonth, presentValue, numberOfPayments, i) {
    var interest = Math.round((interestRate * daysInMonth * presentValue) / 100)
    var principal = i === numberOfPayments - 1 ? presentValue : 0
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  calculate2(interestRate, daysInMonth, presentValue, numberOfPayments) {
    var principal = Math.round(presentValue / numberOfPayments)
    var interest = Math.round((interestRate * daysInMonth * (presentValue - this.incrementalPaidPrincipal)) / 100)
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  calculate3(interestRate, daysInMonth, presentValue, numberOfPayments, i, tempIncrementalPaidPrincipal) {
    var redemption = Math.round(pmt(interestRate / 100, numberOfPayments, -presentValue))
    var interest = Math.round((interestRate * (presentValue - tempIncrementalPaidPrincipal)) / 100)
    var principal = redemption - interest

    return { interest, principal, redemption }
  }

  calculate4(interestRate, daysInMonth, presentValue, numberOfPayments, i) {
    var interest = Math.round((interestRate * daysInMonth * presentValue) / 100)
    var principal = i === numberOfPayments - 1 ? presentValue : 0
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  handleFirstHaflPaydownPeriod(periodObj, paydownObj, blockPenalty) {
    const oldPaydownPeriodEndDate = periodObj.periodEndDate
    var tempPaydownDate = new Date(paydownObj.date)
    // update new period end date, handle first half pay down period
    periodObj.periodEndDate = new Date(tempPaydownDate)
    periodObj.redemptionDate = new Date(periodObj.periodEndDate)
    periodObj.realLifeDate = new Date(tempPaydownDate.setDate(tempPaydownDate.getDate() + 1))
    // periodObj.blockPenalty = blockPenalty
    periodObj.payDown = -parseFloat(paydownObj.value)
    var principal = 0
    var interest = Math.round((this.interestRate *
      (Math.abs((periodObj.periodEndDate - periodObj.periodStartDate) / (1000 * 24 * 60 * 60))) * (this.presentValue)) / 100)
    var redemption = principal + interest

    periodObj.updateTotalPayment(interest, principal, redemption, blockPenalty)

    return oldPaydownPeriodEndDate
  }

  loanMore(loanMoreDate) {

  }
  // { date: Sun Nov 08 2020 07:00:00 GMT+0700 (Indochina Time),
  // value: 10000000 }
  payDown(obj, block) {
    var blockPenalty = new Date(obj.date).getTime() < new Date(block.blockDate).getTime() ?
      Math.round((parseFloat(block.preBlockPenalty ? block.preBlockPenalty : 0) * parseFloat(obj.value)) / 100) :
      Math.round((parseFloat(block.postBlockPenalty ? block.postBlockPenalty : 0) * parseFloat(obj.value)) / 100)

    // handle the period where users pay down in
    // split that period into 2 period: 
    // 1st period: from redemptiondate to the day they paydown
    // 2nd period: from the day they paydown to the next period's redemption date
    // after that, re-calculate the period records for the rest of periods
    console.log('paydown obj: ', obj)
    var upperHalfPeriodRecords = this.periodRecords.filter(rec => {
      return rec.periodStartDate <= obj.date
    })
    console.log('upper half period records: ', upperHalfPeriodRecords)

    // paydown period
    var paydownPeriod = upperHalfPeriodRecords[upperHalfPeriodRecords.length - 1]
    console.log('upper half period: ', paydownPeriod)
    var paydownPeriodIndex = upperHalfPeriodRecords.indexOf(paydownPeriod)


    var oldPaydownPeriodEndDate = this.handleFirstHaflPaydownPeriod(paydownPeriod, obj, blockPenalty)

    // update the length of number of payments
    this.numberOfPeriods += 1

    // number of payments after paying down
    const numberOfPaymentsAfterPayingDown = this.numberOfPeriods - upperHalfPeriodRecords.length
    console.log('number of payment after paying down: ', numberOfPaymentsAfterPayingDown)

    // update new period records
    this.periodRecords = upperHalfPeriodRecords

    // update present value and remain origin
    this.presentValue -= parseFloat(obj.value)
    this.updatePresentValue()

    for (var i = paydownPeriod.period + 1; i < this.numberOfPeriods; i++) {
      if (i === paydownPeriod.period + 1) {

        var periodStartDate = new Date(obj.date)

        var periodEndDate = new Date(oldPaydownPeriodEndDate)

        var redemptionDate = new Date(periodEndDate)
        var periodRecord = this.createPeriodRecord(redemptionDate, periodStartDate, periodEndDate, i,
          this.presentValue, numberOfPaymentsAfterPayingDown, 0)
        this.periodRecords.push(periodRecord)
      } else {
        var tempPeriodStartDate = new Date(this.periodRecords[i - 1].periodEndDate)
        var periodStartDate = tempPeriodStartDate

        var tempPeriodEndDate = new Date(this.periodRecords[i - 1].periodEndDate)
        var periodEndDate = tempPeriodEndDate.addMonths(1)

        var redemptionDate = new Date(periodEndDate)
        var periodRecord = this.createPeriodRecord(redemptionDate, periodStartDate, periodEndDate, i,
          this.presentValue, numberOfPaymentsAfterPayingDown)
        this.periodRecords.push(periodRecord)
      }
    }

  }

}

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate()
}
