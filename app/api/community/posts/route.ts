// app/api/community/posts/route.ts
import { NextResponse } from "next/server"

type Post = {
  id: string
  author: string
  content: string
  createdAt: string
  likes: number
}

let POSTS: Post[] = [
  {
    id: "1",
    author: "Citizen (Demo)",
    content: "Heavy water-logging near Malviya Nagar metro gate 2.",
    createdAt: new Date().toISOString(),
    likes: 3,
  },
]

// GET: list posts
export async function GET() {
  return NextResponse.json(POSTS)
}

// POST: create new post
export async function POST(req: Request) {
  const body = await req.json()
  const content = (body.content ?? "").toString().trim()
  const author = (body.author ?? "Citizen").toString().trim() || "Citizen"

  if (!content) {
    return NextResponse.json({ error: "Content required" }, { status: 400 })
  }

  const newPost: Post = {
    id: Date.now().toString(),
    author,
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
  }

  POSTS = [newPost, ...POSTS]
  return NextResponse.json(newPost, { status: 201 })
}

// PATCH: like a post
export async function PATCH(req: Request) {
  const body = await req.json()
  const id = body.id as string

  const idx = POSTS.findIndex((p) => p.id === id)
  if (idx === -1) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  POSTS[idx] = { ...POSTS[idx], likes: POSTS[idx].likes + 1 }
  return NextResponse.json(POSTS[idx])
}
