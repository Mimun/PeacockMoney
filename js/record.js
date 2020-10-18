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
          record.periodRecords.filter(rec => {
            return rec.period <= updateObj.period

          }).forEach(rec => {
            updateObj.accumulatedPaidInterest += Math.round(rec.interest)
            updateObj.incrementalPaidPrincipal += Math.round(rec.principal)
            updateObj.remainOrigin = updateObj.originalValue - updateObj.incrementalPaidPrincipal
          })

          updateObj.stopCounting()
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'periodStatus', updateObj.periodStatus)
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'accumulatedPaidInterest', updateObj.accumulatedPaidInterest.toLocaleString())
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'incrementalPaidPrincipal', updateObj.incrementalPaidPrincipal.toLocaleString())
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'remainOrigin', updateObj.remainOrigin.toLocaleString())
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

  pauseCounting(period) {
    if (this.periodRecords[period]) {
      this.periodRecords[period].pauseCounting()
    }
  }

  createPeriodRecordForRecord(periodRecord) {
    this.periodRecords.push(periodRecord)
  }

}


