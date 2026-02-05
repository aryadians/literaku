import { NextRequest, NextResponse } from "next/server";

// MOCK DATA (Should be shared but replicated here for simplicity during dev)
const mockReviews = [
  {
    id: "mock-1",
    title: "Mock Review: Harry Potter",
    slug: "harry-potter-mock",
    book_title: "Harry Potter",
    book_author: "J.K. Rowling",
    book_cover_url: "https://m.media-amazon.com/images/I/71-++hbbERL.jpg",
    excerpt: "This is a mock review for testing purposes (Database skipped).",
    content:
      "# Harry Potter Review\n\nThis is a full mock review content. \n\nIt supports markdown.",
    rating: 5,
    created_at: new Date().toISOString(),
    published: true,
    featured: false,
    user_id: "mock-user",
    profiles: {
      name: "Mock Reviewer",
      avatar_url: "https://placehold.co/100x100",
      bio: "Reviewer buku profesional dengan pengalaman 10 tahun.",
    },
    categories: {
      name: "Fiksi",
      slug: "fiksi",
    },
    views: 1250,
    review_likes: [{}, {}, {}], // Mock 3 likes
    review_comments: [
      {
        id: "c1",
        content:
          "Buku ini sangat mengubah cara pandang saya tentang dunia sihir. Wajib baca!",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: "u1",
        profiles: {
          name: "Budi Santoso",
          avatar_url: "https://placehold.co/100x100?text=Budi",
        },
      },
      {
        id: "c2",
        content: "Alurnya agak lambat di tengah, tapi endingnya memuaskan.",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        user_id: "u2",
        profiles: {
          name: "Siti Aminah",
          avatar_url: "https://placehold.co/100x100?text=Siti",
        },
      },
    ],
  },
  {
    id: "mock-2",
    title: "Laskar Pelangi",
    slug: "laskar-pelangi",
    book_title: "Laskar Pelangi",
    book_author: "Andrea Hirata",
    book_cover_url: "https://m.media-amazon.com/images/I/71-++hbbERL.jpg",
    excerpt: "Sebuah kisah inspiratif tentang perjuangan anak-anak Belitong.",
    content: "Full review content Laskar Pelangi...",
    rating: 5,
    created_at: new Date().toISOString(),
    published: true,
    featured: true,
    user_id: "mock-user",
    profiles: {
      name: "Andrea Fan",
      avatar_url: "https://placehold.co/100x100",
      bio: "Penggemar berat karya Andrea Hirata.",
    },
    categories: {
      name: "Non-Fiksi",
      slug: "non-fiksi",
    },
    views: 840,
    review_likes: [{}],
    review_comments: [],
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const slug = (await params).slug; // Next.js 15+ await params

    const review = mockReviews.find((r) => r.slug === slug);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
