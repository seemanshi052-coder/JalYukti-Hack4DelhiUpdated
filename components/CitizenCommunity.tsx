"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageCircle, ThumbsUp } from "lucide-react"

type CommunityPost = {
  id: string
  author: string
  content: string
  createdAt: string
  likes: number
}

export function CitizenCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/community/posts")
      .then((res) => res.json())
      .then((data: CommunityPost[]) => setPosts(data))
      .catch(() => {})
  }, [])

  async function handleSubmit() {
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: author.trim() || "Citizen",
        }),
      })
      if (!res.ok) return
      const newPost: CommunityPost = await res.json()
      setPosts((prev) => [newPost, ...prev])
      setContent("")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLike(id: string) {
    try {
      const res = await fetch("/api/community/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) return
      const updated: CommunityPost = await res.json()
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch {
      // ignore for now
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Citizens Community
        </CardTitle>
        <CardDescription>
          Share ground updates, photos (link URLs), and tips about water‑logging in your area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New post form */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="max-w-xs text-sm"
            />
          </div>
          <Textarea
            placeholder="Share what you are seeing on the ground… (you can paste image or map links here)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>

        {/* Posts list */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No posts yet. Be the first citizen to start the discussion.
            </p>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-border bg-card p-3 text-sm space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{post.author}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleLike(post.id)}
                >
                  <ThumbsUp className="mr-1 h-3 w-3" />
                  Like {post.likes > 0 && <span className="ml-0.5">({post.likes})</span>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
