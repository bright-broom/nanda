export const getDefaultTenantId = (): string => {
  const id = process.env.DEFAULT_TENANT_ID
  if (!id) throw new Error('DEFAULT_TENANT_ID is not set')
  return id
}
