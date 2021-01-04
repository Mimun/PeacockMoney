export var contract = () => {
  return {
    store: {
      cType: 'text',
      dataKor: 'koreanString',
      name: 'store',
      dataVie: 'Cửa hàng',
      value: null
    },
    employee: {
      cType: 'text',
      dataKor: 'koreanString',
      name: 'employee',
      dataVie: 'Nhân viên',
      value: null
    },
    infos: [],
    loanPackage: null,
    blockRules: [],
    penaltyRules: [],
    templateMetadata: [
      {
        cType: "text",
        dataKor: "korean string",
        name: "image",
        value: "/images/5fc0a6a277a174d71d9d36c4.png"
      }, {
        cType: "text",
        dataKor: "korean string",
        name: "contractContent",
        value: "<p>Noi dung hop dong</p>",
        dataVie: "noiDungHopDong"
      }, {
        cType: "text",
        dataKor: "korean string",
        name: "templateName",
        value: "mau hop dong 2",
        dataVie: "Tên mẫu hợp đồng"
      }, {
        cType: "text",
        dataKor: "korean string",
        name: "category",
        value: "",
        dataVie: "phanLoai"
      }, {
        cType: "text",
        dataKor: "korean string",
        name: "itemType",
        value: "loaitaisan1",
        dataVie: "Loại tài sản"
      }, {
        cType: "text",
        dataKor: "korean string",
        name: "itemTypeId",
        value: "loaitaisan1",
        dataVie: "Mã loại tài sản"
      }, {
        cType: "number",
        dataKor: "korean string",
        name: "fee",
        value: "0",
        dataVie: "Phí thu"
      }, {
        cType: "text",
        dataKor: "korean string",
        name: "anotherFee",
        value: "0",
        dataVie: "Phí khác"
      }, {
        cType: "text",
        dataKor: "korean string",
        name: "paymentMethod",
        value: "4",
        dataVie: "Kiểu thanh toán"
      }
    ],
    contractMetadata: [{
      cType: "text",
      dataKor: "koreanString",
      name: "customer",
      value: "Khach hang 1",
      dataVie: "Khách hàng"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "customerId",
      value: "CMND 1",
      dataVie: "CMND"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "customerIdProvidingPlace",
      value: "Noi cap 1",
      dataVie: "Nơi cấp"
    }, {
      cType: "date",
      dataKor: "koreanString",
      name: "customerIdProvidingDate",
      value: "2020-10-08",
      dataVie: "Ngày cấp"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "customerAddress",
      value: "Dia chi 1",
      dataVie: "Địa chỉ"
    }, {
      cType: "number",
      dataKor: "koreanString",
      name: "customerPhoneNumber",
      value: "123123",
      dataVie: "Số điện thoại"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "customerFamilyRegister",
      value: "So ho khau 1",
      dataVie: "Hộ khẩu thường trú"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "loan",
      value: "80000000",
      dataVie: "Số tiền vay"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "loanInWord",
      value: "abcdef",
      dataVie: "Bằng chữ"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "min",
      value: "0",
      dataVie: "Số tiền min"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "max",
      value: "100000000",
      dataVie: "Số tiền max"
    }, {
      cType: "date",
      dataKor: "koreanString",
      name: "contractCreatedDate",
      value: "2020-10-08",
      dataVie: "Ngày lập"
    }, {
      cType: "number",
      dataKor: "koreanString",
      name: "minLoanTerm",
      value: "6",
      dataVie: "Thời hạn vay tối thiểu"
    }, {
      cType: "text",
      dataKor: "koreanString",
      name: "millionPerDay",
      value: "200000",
      dataVie: "Tỉ lệ phần triệu/ngày"
    }, {
      cType: "number",
      dataKor: "koreanString",
      name: "interestRatePerMonth",
      value: "6",
      dataVie: "Tỉ lệ phần trăm theo tháng"
    }, {
      cType: "number",
      dataKor: "koreanString",
      name: "interestRate",
      value: "0.2",
      dataVie: "Tỉ lệ phần trăm theo ngày"
    }, {
      cType: "number",
      dataKor: "koreanString",
      name: "numberOfAcceptanceTerms",
      value: "6",
      dataVie: "Số kỳ thu"
    }, {
      cType: "date",
      dataKor: "koreanString",
      name: "contractEndingDate",
      value: "2021-04-06",
      dataVie: "Ngày kết thúc hợp đồng"
    }],
    items: [],
    id: ''

  }
}

