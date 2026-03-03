import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const adminPassword = process.env.ADMIN_PASSWORD || ""

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { password } = await request.json()

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 1. Delete all candidatures linked to this date
    const { error: deleteCandError } = await supabase
      .from("candidatures")
      .delete()
      .eq("date_id", id)

    if (deleteCandError) {
      console.error("Error deleting candidatures:", deleteCandError)
      return NextResponse.json(
        { error: "Failed to delete associated candidatures" },
        { status: 500 }
      )
    }

    // 2. Delete the date itself
    const { error: deleteDateError } = await supabase
      .from("dates")
      .delete()
      .eq("id", id)

    if (deleteDateError) {
      console.error("Error deleting date:", deleteDateError)
      return NextResponse.json(
        { error: "Failed to delete date" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Date supprimée avec succès",
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
