export var packageTemp = () => {
  return {
    interestRate: 0,
    presentValue: 0,
    agreementDate: "",
    numberOfPeriods: 0,
    ruleArray: [],
    blockArray: [],
    realLifeDate: "",
    simulation: 0,
    contractId: "",
    storeId: "",
    storeName: "",
    customerId: "",
    customerName: "",
    employeeId: "",
    employeeName: "",
    incrementalPaidPrincipal: 0,
    accumulatedPaidInterest: 0,
    remainOrigin: 0,
    paymentSlip: [],
    periodRecords: [],
    periodPaymentSlip: [],
    loanMorePayDownRecords: [],
    receiptRecords: [],
    balance: 0,
    isPause: false,
    currentPeriod: 0,
    tempIncrementalPaidPrincipal: 0,
    incrementalPayment: 0,
    totalPayment: 0,
    totalOverflowPayment: 0,
    totalPrincipalOfOverflowPayments: 0,
    estimatingInterest: 0,
    numberOfLoaningMoreTimes: 0,
    numberOfPayingDownTimes: 0,
    isLoanMoreOrPayDown: false

  }
}