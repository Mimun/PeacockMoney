// import PeriodRecord from './periodRecord2.js'
const PeriodRecord = require('./periodRecord3.js')
module.exports = class Record {
  constructor(object) {
    for (var prop in object) {
      this[prop] = object[prop]
    }
    this.incrementalPaidPrincipal = this.incrementalPaidPrincipal ? this.incrementalPaidPrincipal : 0
    this.accumulatedPaidInterest = this.accumulatedPaidInterest ? this.accumulatedPaidInterest : 0
    this.remainOrigin = this.remainOrigin ? this.remainOrigin : this.presentValue
    this.paymentSlip = this.paymentSlip ? this.paymentSlip : []
    this.periodRecords = this.periodRecords ? this.periodRecords : []
    this.balance = this.balance ? this.balance : 0

    this.isPause = this.isPause ? this.isPause : false
    this.currentPeriod = this.currentPeriod ? this.currentPeriod : 0
    this.tempIncrementalPaidPrincipal = this.tempIncrementalPaidPrincipal ? this.tempIncrementalPaidPrincipal : 0
    this.incrementalPayment = this.incrementalPayment ? this.incrementalPayment : 0
    this.totalPayment = this.totalPayment ? this.totalPayment : 0

    // total overflow payment
    this.totalOverflowPayment = this.totalOverflowPayment ? this.totalOverflowPayment : 0
    this.totalPrincipalOfOverflowPayments = this.totalPrincipalOfOverflowPayments ? this.totalPrincipalOfOverflowPayments : 0

    // estimating
    this.estimatingInterest = this.estimatingInterest ? this.estimatingInterest : 0
    this.numberOfLoaningMoreTimes = this.numberOfLoaningMoreTimes ? this.numberOfLoaningMoreTimes : 0
    this.numberOfPayingDownTimes = this.numberOfPayingDownTimes ? this.numberOfPayingDownTimes : 0
    return this
  }

  updatePaymentRecord(period, obj) {
    this.periodRecords[period] = obj
  }

  updateBalance(amount) {
    this.balance += amount
  }

  paidNotDonePeriod(amount, paidDate, notDonePeriodArray) {
    this.totalPayment += amount
    this.balance += amount
    var i = 0
    const recursive = (balance, paidDate, notDonePeriod, record) => {
      if (balance > 0) {
        console.log('is instance in period record: ', notDonePeriod instanceof PeriodRecord)
        var updateObj = notDonePeriod
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

        if (updateObj.remain <= 0) {
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

        }
        this.periodRecords.filter(record => {
          return record.periodStatus === false && record.redemptionDate > this.realLifeDate
        }).forEach(rec => {
          rec.presentValue = this.presentValue
        })

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

  reCalculatePeriodPayment(periodArray) {
    var tempTotalPayment = this.totalPayment
    var i = 0
    this.incrementalPaidPrincipal = 0
    this.accumulatedPaidInterest = 0
    const recursive = (amount, period) => {
      console.log(`amount before calculate of period ${i}: ${amount}`)
      if (amount > 0) {
        if (period.periodStatus === true) {
          amount -= period.paid
          this.incrementalPaidPrincipal += period.principal
          this.accumulatedPaidInterest += period.interest
        } else {
          period.paid = amount > period.totalPayment ? period.totalPayment : amount
          period.remain = period.totalPayment - period.paid
          period.periodStatus = period.remain === 0 ? true : false

          amount = amount > period.totalPayment ? amount - period.totalPayment : 0

          if (period.remain === 0) {
            this.presentValue -= period.principal
            this.incrementalPaidPrincipal += period.principal
            this.accumulatedPaidInterest += period.interest

            period.incrementalPaidPrincipal = this.incrementalPaidPrincipal
            period.accumulatedPaidInterest = this.accumulatedPaidInterest

          }
          this.periodRecords.filter(record => {
            return record.periodStatus === false && record.redemptionDate > this.realLifeDate
          }).forEach(rec => {
            rec.presentValue = this.presentValue

          })
        }
        i++
        if (periodArray[i]) {
          return recursive(amount, periodArray[i])
        } else {
          return
        }
      } else {
        return
      }

    }
    recursive(tempTotalPayment, this.periodRecords[i])
  }

  updatePresentValue() {
    this.periodRecords.forEach(rec => {
      rec.presentValue = this.presentValue
    })
  }

  // count() {
  //   // this.realLifeDate = new Date(date)
  //   var period = 0
  //   var interval = setInterval(() => {
  //     if (!this.isPause) {
  //       this.currentPeriod = period
  //       if (this.realLifeDate.getTime() === (this.periodRecords[period].redemptionDate.getTime() - (1000 * 24 * 60 * 60))
  //         || this.realLifeDate.getTime() === this.periodRecords[period].redemptionDate.getTime()) {
  //         this.periodRecords[period].count()
  //         period++
  //       }
  //       this.realLifeDate.setDate(this.realLifeDate.getDate() + 1)
  //       document.querySelector('p#real-date-counter span').innerHTML = formatDate(this.realLifeDate)

  //     }
  //   }, 2000)

  // }

  count() {
    // this.currentPeriod = period
    if (this.realLifeDate.getTime() === this.periodRecords[this.currentPeriod].redemptionDate.getTime()) {
      console.log('starting to count the period')
      for (var i = 0; i <= this.currentPeriod; i++) {
        this.periodRecords[i].count(this.realLifeDate)
      }
      this.currentPeriod++
    }
    this.realLifeDate.setDate(this.realLifeDate.getDate() + 1)
    console.log('count in record: ', this.realLifeDate)

  }

  pauseCounting() {
    console.log('period from counting: ', this.currentPeriod)
    this.isPause = !this.isPause
    for (var i = 0; i <= this.currentPeriod; i++) {
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
      this.estimatingInterest += periodRecord.interest
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

    var periodRecord = new PeriodRecord(this.getCreateObj(period, redemptionDate, redemption, principal, 0, interest,
      0, 0, false, periodStartDate, periodEndDate, this.ruleArray, this.presentValue, redemptionDate, blockPenalty, 0, 0, 0))
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

  calculateCustom3(interestRate, principal, daysInMonth, presentValue) {
    var principal = 0
    var interestRate = Math.round(((interestRate * 12) / 365) * 100 + Number.EPSILON) / 100
    console.log('interst rate: ', interestRate)
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
    console.log('current period: ', this.currentPeriod, ', paydown date: ', paydownObj.date)
    const oldPaydownPeriodEndDate = new Date(periodObj.periodEndDate)
    var tempPaydownDate = new Date(paydownObj.date)
    // update new period end date, handle first half pay down period
    var periodStartDate = new Date(periodObj.periodStartDate)
    var periodEndDate = new Date(tempPaydownDate)
    // var realLifeDate = new Date(tempPaydownDate.setDate(tempPaydownDate.getDate() + 1))
    var realLifeDate = new Date(tempPaydownDate.setDate(tempPaydownDate.getDate() + 1))
    const period = periodObj.period

    // periodObj.blockPenalty = blockPenalty
    var daysInMonth = Math.abs((periodEndDate - periodStartDate) / (1000 * 24 * 60 * 60))
    switch (this.simulation) {
      case (1):
        var redemptionDate = new Date(periodEndDate)

        var { interest, principal, redemption } =
          this.calculateCustom1(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(period, redemptionDate, redemption, principal,
          0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, blockPenalty, 0, -parseFloat(paydownObj.value), 0))
        periodObj.isPause = this.isPause
        periodObj.isPaydownPeriod = true

        break
      case (2):
        var redemptionDate = new Date(periodEndDate)

        var { interest, principal, redemption } =
          this.calculateCustom2(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(this.getCreateObj(this.currentPeriod, redemptionDate,
          redemption, principal, 0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, blockPenalty, 0, -parseFloat(paydownObj.value), 0)))
        periodObj.isPause = this.isPause
        periodObj.isPaydownPeriod = true
        break
      case (3):
        var redemptionDate = new Date(periodEndDate)
        var { interest, principal, redemption } =
          this.calculateCustom3(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(this.currentPeriod, redemptionDate, redemption, principal,
          0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, blockPenalty, 0, -parseFloat(paydownObj.value), 0))
        periodObj.isPause = this.isPause
        periodObj.isPaydownPeriod = true

        break
      case (4):
        var redemptionDate = new Date(periodStartDate)

        var { interest, principal, redemption } =
          this.calculateCustom1(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(period, redemptionDate, redemption, principal,
          0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, blockPenalty, 0, -parseFloat(paydownObj.value), 0))
        periodObj.isPause = this.isPause
        periodObj.isPaydownPeriod = true

        break
      default:
    }

    return oldPaydownPeriodEndDate
  }

  handleFirstHaflLoanMorePeriod(periodObj, paydownObj) {
    console.log('current period: ', this.currentPeriod, ', paydown date: ', paydownObj.date)
    const oldPaydownPeriodEndDate = new Date(periodObj.periodEndDate)
    var tempPaydownDate = new Date(paydownObj.date)
    // update new period end date, handle first half pay down period
    var periodStartDate = new Date(periodObj.periodStartDate)
    var periodEndDate = new Date(tempPaydownDate)
    var realLifeDate = new Date(tempPaydownDate.setDate(tempPaydownDate.getDate() + 1))
    // periodObj.blockPenalty = blockPenalty
    var daysInMonth = Math.abs((periodEndDate - periodStartDate) / (1000 * 24 * 60 * 60))
    const period = periodObj.period

    switch (this.simulation) {
      case (1):
        var redemptionDate = new Date(periodEndDate)
        var { interest, principal, redemption } =
          this.calculateCustom1(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(this.currentPeriod, redemptionDate, redemption, principal,
          0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, 0, 0, 0, parseFloat(paydownObj.value)))
        periodObj.isPause = this.isPause
        periodObj.isLoanMorePeriod = true

        break
      case (2):
        var redemptionDate = new Date(periodEndDate)

        var { interest, principal, redemption } =
          this.calculateCustom2(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(this.getCreateObj(this.currentPeriod, redemptionDate, redemption, principal,
          0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, 0, 0, 0, parseFloat(paydownObj.value))))
        periodObj.isPause = this.isPause
        periodObj.isLoanMorePeriod = true

        break
      case (3):
        var redemptionDate = new Date(periodEndDate)
        var { interest, principal, redemption } =
          this.calculateCustom3(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(this.currentPeriod, redemptionDate, redemption, principal,
          0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, 0, 0, 0, parseFloat(paydownObj.value)))
        periodObj.isPause = this.isPause
        periodObj.isLoanMorePeriod = true

        break
      case (4):
        var redemptionDate = new Date(periodStartDate)

        var { interest, principal, redemption } =
          this.calculateCustom4(this.interestRate, 0, daysInMonth, this.presentValue)
        periodObj = Object.assign(periodObj, new PeriodRecord(period, redemptionDate, redemption, principal,
          0, interest, 0, 0, false, periodStartDate, periodEndDate,
          this.ruleArray, this.presentValue, realLifeDate, 0, 0, 0, parseFloat(paydownObj.value)))
        periodObj.isPause = this.isPause
        periodObj.isLoanMorePeriod = true

        break
      default:
    }
    return oldPaydownPeriodEndDate
  }

  // re-create period records
  reCreatePeriodRecords(obj, period, numberOfPaymentsAfterPayingDown, oldPaydownPeriodEndDate, numberOfNewPeriods) {
    console.log('number of new periods: ', this.numberOfPeriods)
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
        for (var i = period + 1; i < parseInt(numberOfNewPeriods) + period + 1; i++) {
          if (i === period + 1) {
            var periodStartDate = new Date(obj.date)

            var tempPeriodEndDate = new Date(periodStartDate)
            var periodEndDate = tempPeriodEndDate.addMonths(1)

            var periodRecord = this.createPeriodRecord(periodStartDate, periodEndDate, i,
              this.presentValue, numberOfPaymentsAfterPayingDown, 0)
            // periodRecord.updateTotalPayment(
            //   periodRecord.interest, periodRecord.principal, periodRecord.redemption, blockPenalty)

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
    // console.log('something here')
    this.resetIncrementalPrincipal()

  }

  loanMore(obj, numberOfNewPeriods) {
    var upperHalfPeriodRecords = this.periodRecords.filter(rec => {
      return rec.periodStartDate <= obj.date
    })

    // paydown period
    var paydownPeriod = upperHalfPeriodRecords[upperHalfPeriodRecords.length - 1]
    var paydownPeriodIndex = upperHalfPeriodRecords.indexOf(paydownPeriod)

    var oldPaydownPeriodEndDate = this.handleFirstHaflLoanMorePeriod(paydownPeriod, obj)


    // update the length of number of payments
    this.numberOfPeriods += 1

    // number of payments after paying down
    const numberOfPaymentsAfterPayingDown = this.numberOfPeriods - upperHalfPeriodRecords.length

    // update new period records
    this.periodRecords = [...upperHalfPeriodRecords]
    console.log('upper half period: ', this.periodRecords)

    // update present value and remain origin
    this.presentValue += parseFloat(obj.value)
    // this.updatePresentValue()

    this.reCreatePeriodRecords(obj, paydownPeriod.period, numberOfPaymentsAfterPayingDown, oldPaydownPeriodEndDate, numberOfNewPeriods)
    this.reCalculatePeriodPayment(this.periodRecords)
    this.numberOfLoaningMoreTimes += 1
  }

  payDown(obj, numberOfNewPeriods) {
    var blockPenalty = this.calculateBlock(obj, this.blockArray)

    var upperHalfPeriodRecords = this.periodRecords.filter(rec => {
      return rec.periodStartDate <= obj.date
      // return rec.period <= this.currentPeriod
    })

    // paydown period
    var paydownPeriod = upperHalfPeriodRecords[upperHalfPeriodRecords.length - 1]
    console.log('upper half period: ', paydownPeriod)
    var paydownPeriodIndex = upperHalfPeriodRecords.indexOf(paydownPeriod)

    var oldPaydownPeriodEndDate = this.handleFirstHaflPaydownPeriod(paydownPeriod, obj, blockPenalty)

    // update the length of number of payments
    this.numberOfPeriods += 1

    // number of payments after paying down
    const numberOfPaymentsAfterPayingDown = this.numberOfPeriods - upperHalfPeriodRecords.length

    // update new period records
    this.periodRecords = [...upperHalfPeriodRecords]
    // update present value and remain origin
    this.presentValue -= parseFloat(obj.value)
    // this.updatePresentValue()

    this.reCreatePeriodRecords(obj, paydownPeriod.period, numberOfPaymentsAfterPayingDown, oldPaydownPeriodEndDate, numberOfNewPeriods)
    this.reCalculatePeriodPayment(this.periodRecords)
    this.numberOfPayingDownTimes += 1
  }

  calculateBlock(obj, block) {
    console.log('block for paying down: ', block)
    if (this.simulation !== 3) {
      console.log('call 1')
      var blockPenalty = new Date(obj.date).getTime() < new Date(block.blockDate).getTime() ?
        Math.round((parseFloat(block.preBlockPenalty ? block.preBlockPenalty : 0) * parseFloat(obj.value)) / 100) :
        Math.round((parseFloat(block.postBlockPenalty ? block.postBlockPenalty : 0) * parseFloat(obj.value)) / 100)
      return blockPenalty
    } else {
      console.log('call 2')

      var donePeriodArray = this.periodRecords.map(rec => {
        return rec.periodStatus === true
      })
      var numberOfDonePeriod = donePeriodArray.length
      console.log('done period: ', numberOfDonePeriod)

      var blockPenalty = numberOfDonePeriod < block.block ?
        Math.round((parseFloat(block.preBlockPenalty ? block.preBlockPenalty : 0) * parseFloat(obj.value)) / 100) :
        Math.round((parseFloat(block.postBlockPenalty ? block.postBlockPenalty : 0) * parseFloat(obj.value)) / 100)
      return blockPenalty
    }
  }

  calculateOverFlowPayments(obj) {
    this.periodRecords.filter(rec => {
      return rec.periodEndDate > obj.date
    }).forEach(rec => {
      this.totalOverflowPayment += rec.paid
    })
    this.periodRecords.filter(rec => {
      return rec.periodEndDate > obj.date && rec.periodStatus == true
    }).forEach(rec => {
      this.totalPrincipalOfOverflowPayments += rec.principal
    })
    console.log('total overflow payment: ', this.totalOverflowPayment, ', total principal of overfllow payments: ', this.totalPrincipalOfOverflowPayments)
  }

  resetOverFlowPayments() {
    this.totalOverflowPayment = 0
    this.totalPrincipalOfOverflowPayments = 0
  }

  // reset temp incremental principal
  resetIncrementalPrincipal() {
    this.tempIncrementalPaidPrincipal = 0
  }

  // reset incremental payment
  resetIncrementalPayment() {
    this.incrementalPayment = 0
  }

  // get estimating interest
  getEstimatingInterest() {
    return this.estimatingInterest
  }

  // get last paid principal
  getLastPaidPrincipal() {
    var lastPaidPrincipal = this.periodRecords.filter(record => {
      return record.paid !== 0
    }).pop().paymentRecords.pop()

  }

  // get number of loanmore| paydown times
  getLoaningMoreTimes() {
    return this.numberOfLoaningMoreTimes
  }

  getPayingDownTimes() {
    return this.numberOfPayingDownTimes
  }

  // recreate period records
  reassignPeriodRecords() {
    this.periodRecords = this.periodRecords.map(record => {
      return new PeriodRecord(record)
    })
  }

  getCreateObj(period, redemptionDate, redemption, principal, incrementalPaidPrincipal, interest, accumulatedPaidInterest,
    remainOrigin, periodStatus, periodStartDate, periodEndDate, ruleArray, presentValue, realLifeDate, blockPenalty = 0, daysBetween,
    payDown, loanMore, appliedRule = null, penalty = 0, totalPenalty, penaltyRecord = [], paymentRecords = [], totalPayment,
    paid = 0, remain, isPause, numericalOrder, isLoanMorePeriod, isPaydownPeriod) {
    var obj = new function () {
      this.period = period
      this.redemptionDate = new Date(redemptionDate)
      this.redemption = redemption
      this.principal = principal
      this.incrementalPaidPrincipal = incrementalPaidPrincipal
      this.interest = interest
      this.accumulatedPaidInterest = accumulatedPaidInterest
      this.remainOrigin = remainOrigin
      this.periodStatus = periodStatus
      this.periodStartDate = periodStartDate
      this.periodEndDate = periodEndDate
      this.ruleArray = ruleArray
      this.presentValue = presentValue
      this.realLifeDate = new Date(realLifeDate)
      this.blockPenalty = blockPenalty
      this.daysBetween = daysBetween
      this.payDown = payDown
      this.loanMore = loanMore

      this.appliedRule = appliedRule
      this.penalty = penalty
      this.totalPenalty = totalPenalty || this.penalty + this.blockPenalty
      this.penaltyRecord = penaltyRecord
      this.paymentRecords = paymentRecords

      this.totalPayment = totalPayment || this.redemption + this.blockPenalty + this.penalty
      this.paid = paid
      this.remain = remain || this.totalPayment - this.paid


      this.isPause = isPause || false
      this.numericalOrder = numericalOrder || this.period + 1
      this.isLoanMorePeriod = isLoanMorePeriod || false
      this.isPaydownPeriod = isPaydownPeriod || false
    }

    return obj
  }

}

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate()
}

Date.isLeapYear = function (year) {
  return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function (year, month) {
  return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () {
  return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
  return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
  var n = this.getDate();
  this.setDate(1);
  this.setMonth(this.getMonth() + value);
  this.setDate(Math.min(n, this.getDaysInMonth()));
  return this;
};

const getDateAfterAnAmountOfDates = (date, amount) => {
  return formatDate(new Date(date.setDate(date.getDate() + amount)))
}

const getDateAfterAnAmountOfMonths = (originalDate, amount) => {
  var date = new Date(originalDate)
  var redemptionDate = new Date(date.setMonth(date.getMonth() + amount))
  const oneDay = 24 * 60 * 60 * 1000
  var daysInMonth = Math.abs((redemptionDate - originalDate) / oneDay)
  return {
    redemptionDate, daysInMonth
  }
}

const getDaysBetween = (d1, d2) => {
  let date1 = new Date(d1)
  let date2 = new Date(d2)
  var oneDay = 1000 * 60 * 60 * 24
  var msDifference = date1.getTime() - date2.getTime()
  var daysDifference = Math.abs(msDifference / oneDay)
  return daysDifference
}

function pmt(rate_per_period, number_of_payments, present_value, future_value, type) {
  future_value = typeof future_value !== 'undefined' ? future_value : 0;
  type = typeof type !== 'undefined' ? type : 0;

  if (rate_per_period != 0.0) {
    // Interest rate exists
    var q = Math.pow(1 + rate_per_period, number_of_payments);
    return -(rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)));

  } else if (number_of_payments != 0.0) {
    // No interest rate, but number of payments exists
    return -(future_value + present_value) / number_of_payments;
  }

  return 0;
}


const formatDate = (date) => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [day, month, year].join('-');
}