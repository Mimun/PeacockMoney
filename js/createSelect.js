export const createSelect = (selectTemplate, selecteValue, selectId,
  selectClassName, selectOptions, labelTemplate, labelContent, selectContainer, divAppend, disabled) => {
  var select = selectTemplate.cloneNode(true)
  select.id = selectId
  select.innerHTML = selectOptions
  select.value = selecteValue
  select.classList.add(selectClassName)
  select.disabled = disabled

  var selectLabel = labelTemplate.cloneNode(true)
  selectLabel.setAttribute('for', selectId)
  selectLabel.innerHTML = labelContent

  var selectContainerClone = selectContainer.cloneNode(true)
  selectContainerClone.appendChild(selectLabel)
  selectContainerClone.appendChild(select)
  divAppend.appendChild(selectContainerClone)

}