import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import type { NextRequest } from "next/server"
import { typeDefs } from "@/graphql/schema"
import { resolvers } from "@/graphql/resolvers"
import { getCurrentUser } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// Create handler for Next.js API route
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    // Get the current user from the session
    const sessionUser = await getCurrentUser()
    
    // If we have a session user, fetch the full user from the database
    const user = sessionUser ? await prisma.user.findUnique({ where: { id: sessionUser.id } }) : null

    // Return the context with the user
    return { user }
  },
})

export { handler as GET, handler as POST }
