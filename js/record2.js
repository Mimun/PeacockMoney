import PeriodRecord from './periodRecord2.js'
export default class Record {
  constructor(interestRate = 0, presentValue = 0, agreementDate = new Date(Date.now()),
    numberOfPeriods = 0, ruleArray = [], realLifeDate, simulation) {
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
    this.simulation = simulation
    this.tempIncrementalPaidPrincipal = 0
    this.incrementalPayment = 0
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
        this.incrementalPayment += updateObj.paid
        console.log('incremental payment: ', this.incrementalPayment)
        updateObj.updatePeriodTable('period-table-container', updateObj.period, 'paid', updateObj.paid.toLocaleString())
        updateObj.updatePeriodTable('period-table-container', updateObj.period, 'remain', updateObj.remain.toLocaleString())
        updateObj.updateHistoryPayment('payment-history', paidDate)

        if (updateObj.remain === 0) {
          updateObj.periodStatus = true
          // updateObj.penalty = 0
          this.presentValue = this.presentValue - updateObj.principal
          this.accumulatedPaidInterest += updateObj.interest
          this.incrementalPaidPrincipal += updateObj.principal

          // this.updatePresentValue()
          updateObj.presentValue = this.presentValue
          updateObj.accumulatedPaidInterest = this.accumulatedPaidInterest
          updateObj.incrementalPaidPrincipal = this.incrementalPaidPrincipal

          updateObj.stopCounting()
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'periodStatus', updateObj.periodStatus)
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'accumulatedPaidInterest', updateObj.accumulatedPaidInterest.toLocaleString())
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'incrementalPaidPrincipal', updateObj.incrementalPaidPrincipal.toLocaleString())
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'presentValue', this.presentValue.toLocaleString())
          updateObj.updatePeriodTable('period-table-container', updateObj.period, 'penalty', updateObj.penalty.toLocaleString())

        }

        console.log('record after paying: ', record)
        i++
        if (notDonePeriodArray[i]) {
          // if (updateObj.remain < 0) {
          //   return recursive(Math.abs(update.remain), paidDate, notDonePeriodArray[i], record)
          // } else {

          // }
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
    for (var i = 0; i < this.numberOfPeriods; i++) {
      var tempPeriodStartDate = new Date(this.agreementDate)
      var periodStartDate = tempPeriodStartDate.addMonths(i)

      var tempPeriodEndDate = new Date(this.agreementDate)
      var periodEndDate = tempPeriodEndDate.addMonths(i + 1)

      var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate,
        i, this.presentValue, this.numberOfPeriods)
      this.periodRecords.push(periodRecord)

    }
    this.resetIncrementalPrincipal()
  }

  createPeriodRecord(periodStartDate, periodEndDate, period, presentValue, numberOfPeriods, blockPenalty = 0) {
    var redemptionDate = null
    var daysInMonth = Math.abs((periodEndDate - periodStartDate) / (1000 * 24 * 60 * 60))
    switch (this.simulation) {
      case (1):
        redemptionDate = new Date(periodEndDate)
        var { interest, principal, redemption } =
          this.calculate1(this.interestRate, daysInMonth, presentValue, numberOfPeriods, period)

        break
      case (2):
        redemptionDate = new Date(periodEndDate)
        var { interest, principal, redemption } =
          this.calculate2(this.interestRate, daysInMonth, presentValue, numberOfPeriods, this.tempIncrementalPaidPrincipal)
        this.tempIncrementalPaidPrincipal += principal

        break
      case (3):
        redemptionDate = new Date(periodEndDate)
        var { interest, principal, redemption } =
          this.calculate3(this.interestRate, presentValue, numberOfPeriods, this.tempIncrementalPaidPrincipal)
        this.tempIncrementalPaidPrincipal += principal

        break
      case (4):
        redemptionDate = new Date(periodStartDate)
        var { interest, principal, redemption } =
          this.calculate4(this.interestRate, daysInMonth, presentValue, numberOfPeriods, period)
        break
      default:
    }

    var periodRecord = new PeriodRecord(period, redemptionDate, redemption, principal, 0, interest,
      0, 0, false, periodStartDate, periodEndDate, this.ruleArray, this.presentValue, redemptionDate, blockPenalty)
    return periodRecord
  }

  // create interest, redemption, principal for the 1st time
  calculate1(interestRate, daysInMonth, presentValue, numberOfPayments, i) {
    var interest = Math.round((interestRate * daysInMonth * presentValue) / 100)
    var principal = i === numberOfPayments - 1 ? presentValue : 0
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  calculate2(interestRate, daysInMonth, presentValue, numberOfPayments, incrementalPaidPrincipal) {
    var principal = Math.round(presentValue / numberOfPayments)
    var interest = Math.round((interestRate * daysInMonth * (presentValue - incrementalPaidPrincipal)) / 100)
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  calculate3(interestRate, presentValue, numberOfPayments, tempIncrementalPaidPrincipal) {
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

  // create interest, redemption, principal after paying down
  calculateCustom1(interestRate, principal, daysInMonth, presentValue) {
    var interest = Math.round((interestRate * daysInMonth * presentValue) / 100)
    var principal = principal
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  calculateCustom2(interestRate, principal, daysInMonth, presentValue) {
    var principal = 0
    var interest = Math.round((interestRate * daysInMonth * presentValue) / 100)
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  calculateCustom4(interestRate, principal, daysInMonth, presentValue) {
    var interest = Math.round((interestRate * daysInMonth * presentValue) / 100)
    var principal = principal
    var redemption = principal + interest

    return { interest, principal, redemption }
  }

  handleFirstHaflPaydownPeriod(periodObj, paydownObj, blockPenalty) {
    const oldPaydownPeriodEndDate = periodObj.periodEndDate
    var tempPaydownDate = new Date(paydownObj.date)
    // update new period end date, handle first half pay down period
    periodObj.periodEndDate = new Date(tempPaydownDate)
    periodObj.realLifeDate = new Date(tempPaydownDate.setDate(tempPaydownDate.getDate() + 1))
    // periodObj.blockPenalty = blockPenalty
    periodObj.payDown = -parseFloat(paydownObj.value)
    var daysInMonth = Math.abs((periodObj.periodEndDate - periodObj.periodStartDate) / (1000 * 24 * 60 * 60))
    switch (this.simulation) {
      case (1):
        periodObj.redemptionDate = new Date(periodObj.periodEndDate)

        var { interest, principal, redemption } =
          this.calculateCustom1(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, blockPenalty)

        break
      case (2):
        periodObj.redemptionDate = new Date(periodObj.periodEndDate)

        var { interest, principal, redemption } =
          this.calculateCustom2(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, blockPenalty)

        break
      case (3):
        periodObj.redemptionDate = new Date(periodObj.periodEndDate)

        var { interest, principal, redemption } =
          this.calculate3(this.interestRate, presentValue, numberOfPeriods, this.tempIncrementalPaidPrincipal)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, blockPenalty)

        break
      case (4):
        periodObj.redemptionDate = new Date(periodObj.periodStartDate)

        var { interest, principal, redemption } =
          this.calculateCustom4(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, blockPenalty)

        break
      default:
    }

    return oldPaydownPeriodEndDate
  }

  handleFirstHaflLoanMorePeriod(periodObj, paydownObj) {
    const oldPaydownPeriodEndDate = periodObj.periodEndDate
    var tempPaydownDate = new Date(paydownObj.date)
    // update new period end date, handle first half pay down period
    periodObj.periodEndDate = new Date(tempPaydownDate)
    periodObj.realLifeDate = new Date(tempPaydownDate.setDate(tempPaydownDate.getDate() + 1))
    // periodObj.blockPenalty = blockPenalty
    periodObj.loanMore = parseFloat(paydownObj.value)
    var daysInMonth = Math.abs((periodObj.periodEndDate - periodObj.periodStartDate) / (1000 * 24 * 60 * 60))
    switch (this.simulation) {
      case (1):
        periodObj.redemptionDate = new Date(periodObj.periodEndDate)

        var { interest, principal, redemption } =
          this.calculateCustom1(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, 0)

        break
      case (2):
        periodObj.redemptionDate = new Date(periodObj.periodEndDate)

        var { interest, principal, redemption } =
          this.calculateCustom2(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, 0)

        break
      case (3):
        periodObj.redemptionDate = new Date(periodObj.periodEndDate)

        var { interest, principal, redemption } =
          this.calculate3(this.interestRate, presentValue, numberOfPeriods, this.tempIncrementalPaidPrincipal)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, 0)

        break
      case (4):
        periodObj.redemptionDate = new Date(periodObj.periodStartDate)

        var { interest, principal, redemption } =
          this.calculateCustom4(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj.updateTotalPayment(interest, principal, redemption, this.presentValue, 0)

        break
      default:
    }
    return oldPaydownPeriodEndDate
  }

  // re-create period records
  reCreatePeriodRecords(obj, period, numberOfPaymentsAfterPayingDown, oldPaydownPeriodEndDate, blockPenalty) {
    switch (this.simulation) {
      case (1):
        for (var i = period + 1; i < this.numberOfPeriods; i++) {
          if (i === period + 1) {

            var periodStartDate = new Date(obj.date)

            var periodEndDate = new Date(oldPaydownPeriodEndDate)

            var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
              this.presentValue, this.numberOfPeriods, 0)
            this.periodRecords.push(periodRecord)
          } else {
            var tempPeriodStartDate = new Date(this.periodRecords[i - 1].periodEndDate)
            var periodStartDate = tempPeriodStartDate

            var tempPeriodEndDate = new Date(this.periodRecords[i - 1].periodEndDate)
            var periodEndDate = tempPeriodEndDate.addMonths(1)

            var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
              this.presentValue, this.numberOfPeriods, 0)
            this.periodRecords.push(periodRecord)
          }
        }

        break
      case (2):
        for (var i = period + 1; i < this.numberOfPeriods; i++) {
          if (i === period + 1) {

            var periodStartDate = new Date(obj.date)

            var periodEndDate = new Date(oldPaydownPeriodEndDate)

            var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
              this.presentValue, numberOfPaymentsAfterPayingDown, 0)
            this.periodRecords.push(periodRecord)
          } else {
            var tempPeriodStartDate = new Date(this.periodRecords[i - 1].periodEndDate)
            var periodStartDate = tempPeriodStartDate

            var tempPeriodEndDate = new Date(this.periodRecords[i - 1].periodEndDate)
            var periodEndDate = tempPeriodEndDate.addMonths(1)

            var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
              this.presentValue, numberOfPaymentsAfterPayingDown)
            this.periodRecords.push(periodRecord)
          }
        }

        break
      case (3):
        console.log(`period: ${period}, numberOfPaymentsAfterPayingDown: ${parseInt(numberOfPaymentsAfterPayingDown) + period + 1}`)
        for (var i = period + 1; i < parseInt(numberOfPaymentsAfterPayingDown) + period + 1; i++) {
          var tempPeriodStartDate = new Date(this.periodRecords[i - 1].periodEndDate)
          var periodStartDate = tempPeriodStartDate

          var tempPeriodEndDate = new Date(this.periodRecords[i - 1].periodEndDate)
          var periodEndDate = tempPeriodEndDate.addMonths(1)

          var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
            this.presentValue, numberOfPaymentsAfterPayingDown)
          if (blockPenalty) {
            if (i === period + 1) {
              periodRecord.updateTotalPayment(periodRecord.interest, periodRecord.principal, periodRecord.redemption, blockPenalty)
            }
          }

          this.periodRecords.push(periodRecord)
        }

        break
      case (4):
        for (var i = period + 1; i < this.numberOfPeriods; i++) {
          if (i === period + 1) {

            var periodStartDate = new Date(obj.date)

            var periodEndDate = new Date(oldPaydownPeriodEndDate)

            var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
              this.presentValue, this.numberOfPeriods, 0)
            this.periodRecords.push(periodRecord)
          } else {
            var tempPeriodStartDate = new Date(this.periodRecords[i - 1].periodEndDate)
            var periodStartDate = tempPeriodStartDate

            var tempPeriodEndDate = new Date(this.periodRecords[i - 1].periodEndDate)
            var periodEndDate = tempPeriodEndDate.addMonths(1)

            var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
              this.presentValue, this.numberOfPeriods, 0)
            this.periodRecords.push(periodRecord)
          }
        }

        break
      default:
    }
    this.resetIncrementalPrincipal()
  }

  loanMore(obj, numberOfNewPeriods) {
    console.log('obj: ', obj)
    var paidPeriodRecords = this.periodRecords.filter(rec => {
      return rec.periodStartDate <= obj.date && rec.periodStatus === true
    })
    console.log('paid period records: ', paidPeriodRecords)
    if (this.simulation !== 3) {
      console.log('paydown obj: ', obj)
      // paid periods


      var upperHalfPeriodRecords = this.periodRecords.filter(rec => {
        return rec.periodStartDate <= obj.date
      })
      console.log('upper half period records: ', upperHalfPeriodRecords)

      // paydown period
      var paydownPeriod = upperHalfPeriodRecords[upperHalfPeriodRecords.length - 1]
      console.log('upper half period: ', paydownPeriod)
      var paydownPeriodIndex = upperHalfPeriodRecords.indexOf(paydownPeriod)

      var oldPaydownPeriodEndDate = this.handleFirstHaflLoanMorePeriod(paydownPeriod, obj)

      // update the length of number of payments
      this.numberOfPeriods += 1

      // number of payments after paying down
      const numberOfPaymentsAfterPayingDown = this.numberOfPeriods - upperHalfPeriodRecords.length
      console.log('number of payment after paying down: ', numberOfPaymentsAfterPayingDown)

      // update new period records
      this.periodRecords = upperHalfPeriodRecords

      // update present value and remain origin
      this.presentValue += parseFloat(obj.value)
      // this.updatePresentValue()

      this.reCreatePeriodRecords(obj, paydownPeriod.period, numberOfPaymentsAfterPayingDown, oldPaydownPeriodEndDate)
    } else {
      this.periodRecords = this.periodRecords.filter(rec => {
        return rec.periodStatus === true
      })
      // update present value and remain origin
      this.presentValue += parseFloat(obj.value)
      // this.updatePresentValue()
      this.reCreatePeriodRecords(obj, this.periodRecords[this.periodRecords.length - 1].period, numberOfNewPeriods, null)

    }
  }

  payDown(obj, block, numberOfNewPeriods) {
    console.log('obj: ', obj)
    var blockPenalty = new Date(obj.date).getTime() < new Date(block.blockDate).getTime() ?
      Math.round((parseFloat(block.preBlockPenalty ? block.preBlockPenalty : 0) * parseFloat(obj.value)) / 100) :
      Math.round((parseFloat(block.postBlockPenalty ? block.postBlockPenalty : 0) * parseFloat(obj.value)) / 100)
    var paidPeriodRecords = this.periodRecords.filter(rec => {
      return rec.periodStartDate <= obj.date && rec.periodStatus === true
    })
    console.log('paid period records: ', paidPeriodRecords)

    // handle the period where users pay down in
    // split that period into 2 period: 
    // 1st period: from redemptiondate to the day they paydown
    // 2nd period: from the day they paydown to the next period's redemption date
    // after that, re-calculate the period records for the rest of periods
    console.log(`number of new periods: ${numberOfNewPeriods}`)
    if (this.simulation !== 3) {
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
      // this.updatePresentValue()

      this.reCreatePeriodRecords(obj, paydownPeriod.period, numberOfPaymentsAfterPayingDown, oldPaydownPeriodEndDate)
    } else if (this.simulation === 3) {
      this.periodRecords = this.periodRecords.filter(rec => {
        return rec.periodStatus === true
      })
      // update present value and remain origin
      this.presentValue -= parseFloat(obj.value)
      // this.updatePresentValue()
      this.reCreatePeriodRecords(obj, this.periodRecords[this.periodRecords.length - 1].period, numberOfNewPeriods, null, blockPenalty)

    }
    var paidValue = 0
    paidPeriodRecords.forEach(rec => {
      paidValue += rec.paid
    })
    var remainAfterPaying = this.incrementalPayment - paidValue
    var notDonePeriodArray = this.periodRecords.filter(rec => {
      return rec.periodStatus === false
    })
    this.paidNotDonePeriod(remainAfterPaying, obj.date, notDonePeriodArray)

  }

  // reset temp incremental principal
  resetIncrementalPrincipal() {
    this.tempIncrementalPaidPrincipal = 0
  }

}

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate()
}
