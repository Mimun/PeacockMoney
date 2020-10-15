export default class Record {
  constructor() {
    this.paymentSlip = []
    this.periodRecords = []
    this.startDate = new Date(Date.now())
    this.ages = 0
    this.overdue = 0
    this.balance = 0
  }

  updatePaymentRecord(period, obj) {
    this.periodRecords[period] = obj
  }

  updateBalance(amount) {
    this.balance += amount
  }

  payedNotDonePeriod(amount, payedDate, notDonePeriodArray) {
    this.balance += amount
    var i = 0
    const recursive = (balance, payedDate, notDonePeriod, record) => {
      if (balance > 0) {
        var updateObj = notDonePeriod
        console.log('update obj: ', updateObj)
        // enough money for total payment of that period
        var payment = balance <= updateObj.remain ? balance : updateObj.remain
        updateObj.payed = updateObj.payed + payment
        updateObj.remain = updateObj.remain - payment
        balance = balance - payment
        if (updateObj.remain === 0) {
          updateObj.periodStatus = true
          updateObj.stopCounting()
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'periodStatus', updateObj.periodStatus)

        }
        updateObj.paymentRecords.push({
          payed: payment,
          date: payedDate
        })
        record.updatePaymentRecord(updateObj.period, updateObj)
        updateObj.updatePeriodTable('period-table-container', updateObj.period, 'payed', updateObj.payed)
        updateObj.updatePeriodTable('period-table-container', updateObj.period, 'remain', updateObj.remain)
        updateObj.updateHistoryPayment('payment-history')

        console.log('record after paying: ', record)
        i++
        if (notDonePeriodArray[i]) {
          return recursive(balance, payedDate, notDonePeriodArray[i], record)

        } else {
          return balance
        }
      } else {
        return balance
      }
    }
    var balance = recursive(this.balance, payedDate, notDonePeriodArray[i], this)
    this.balance = balance

  }

  pauseCounting(period) {
    if (this.periodRecords[period]) {
      this.periodRecords[period].pauseCounting()
    }
  }

}


