
'use strict'

let Type = function () { }

Type.prototype.bIsUndef = function (variable) {
  return typeof variable === 'undefined'
}

Type.prototype.bIsNull = function (variable) {
  return this.bIsUndef(variable) || variable === null
}

Type.prototype.bIsEmptyStr = function (variable) {
  return this.bIsNull(variable) || variable === ''
}

Type.prototype.bIsArray = function (variable) {
  return this.bIsNull(variable) === false && Array.isArray(variable)
}

Type.prototype.bIsInteger = function (variable) {
  if (this.bIsEmptyStr(variable)) {
    return false
  }

  let i = 0
  let sVariable = variable.toString()
  if (sVariable.length > 0 && sVariable[0] === '-') {
    ++i
  }

  for (; i < sVariable.length; ++i) {
    if (sVariable[i] >= '0' && sVariable[i] <= '9') {
      continue
    }

    return false
  }

  return true
}

Type.prototype.iConvert = function (sVar, iDefaultValue) {
  let iReturnValue = 0
  if (this.bIsUndef(iDefaultValue) === false) {
    iReturnValue = iDefaultValue
  }

  if (this.bIsInteger(sVar) === false) {
    return iReturnValue
  }

  return parseInt(sVar)
}

Type.prototype.sConvert = function (sVar) {
  if (this.bIsNull(sVar)) {
    return ''
  }

  return sVar
}

Type.prototype.aConvert = function (sVar) {
  if (this.bIsArray(sVar)) {
    return sVar
  }

  if (sVar[0] !== '[') {
    return []
  }

  return JSON.parse(sVar)
}

Type.prototype.convert = function (sVar) {
  if (this.bIsEmptyStr(sVar)) {
    return {}
  }

  if (sVar[0] !== '{') {
    return {}
  }

  return JSON.parse(sVar)
}

module.exports = new Type()
