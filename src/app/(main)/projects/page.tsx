import PostEditor from '@/components/project/editor/PostEditor'
import { Project } from '@/components/project/project'

import prisma from '@/lib/prisma'

export default async function Home() {
  const projects = await prisma.project.findMany({
    include: {
      user: {
        select: {
          privyUserId: true,
          email: true,
          appleEmail: true,
          googleEmail: true,
          twitterUsername: true,
          walletAddress: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className='mx-auto w-full max-w-2xl space-y-6 overflow-y-auto p-4'>
      <PostEditor />
      {projects.map((project) => (
        <Project key={project.id} project={project} />
      ))}
    </div>
  )
}
