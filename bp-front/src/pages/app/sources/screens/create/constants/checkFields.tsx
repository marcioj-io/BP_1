const requiredFieldsGeralConst = {
  name: false,
  phone: false,
  fax: false,
  address: false,
  email: false,
  site: false,
  register: false,
  registrationIssuanceDate: false,
  registrationIssuingBody: false,
  bankReference: false,
  commercialReference: false
}

const requiredFieldsPFConst = {
  birthday: false,
  maritalStatus: false,
  fatherName: false,
  motherName: false,
  naturalness: false,
  nationality: false,
  familyIncome: false
}

const requiredFieldsPJConst = {
  socialName: false,
  shareCapital: false,
  municipalRegistration: false,
  stateRegistration: false,
  latestContractAmendment: false,
  businessSegment: false
}

export {
  requiredFieldsPJConst,
  requiredFieldsPFConst,
  requiredFieldsGeralConst
}
