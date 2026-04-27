import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const email = 'hieu.tran@inbox4us.xyz'
  const clerkOrgId = 'org_3CmwDxbcwYqKaKNrz2H86AjxIKq'

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: {
              organization: true,
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  console.log(`User: ${user.name} (${user.email})`)
  
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId }
  })
  
  const internalOrgId = org?.id
  console.log(`Org: ${org?.name} (Clerk: ${clerkOrgId}, Internal: ${internalOrgId})`)

  const activeRoles = user.roles.filter(ur => ur.role.organizationId === internalOrgId)
  
  console.log('\nActive Roles for this Org:')
  activeRoles.forEach(ur => {
    console.log(`- Role: ${ur.role.name}`)
    console.log(`  Permissions: ${ur.role.permissions.map(p => p.permission.name).join(', ')}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
