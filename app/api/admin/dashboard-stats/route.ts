import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all data in parallel with error handling
    const [
      newsletterSubscribers,
      contactSubmissions,
      blogPosts,
      instagramPosts,
      tiktokVideos,
      featuredContent,
      pricingSubscriptions
    ] = await Promise.all([
      // Newsletter subscribers
      db.collection('newsletter_subscriptions').countDocuments().catch(() => 0),
      
      // Contact submissions
      db.collection('contact_submissions').countDocuments().catch(() => 0),
      
      // Blog posts
      db.collection('blog_posts').countDocuments().catch(() => 0),
      
      // Instagram posts
      db.collection('instagram_posts').countDocuments().catch(() => 0),
      
      // TikTok videos
      db.collection('tiktok_videos').countDocuments().catch(() => 0),
      
      // Featured content
      db.collection('featured_content').countDocuments().catch(() => 0),
      
      // Pricing subscriptions - handle case where collection might not exist
      db.collection('pricingsubscriptions').find({}).toArray().catch(() => [])
    ]);

    // Calculate total revenue from paid subscriptions
    const totalRevenue = pricingSubscriptions.reduce((sum: number, sub: any) => {
      return sum + (sub.paymentStatus === 'paid' ? sub.amount : 0);
    }, 0);

    // Calculate monthly growth
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get current month subscriptions
    const currentMonthSubscriptions = pricingSubscriptions.filter((sub: any) => {
      const subDate = new Date(sub.createdAt);
      return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
    }).length;

    // Get previous month subscriptions
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthSubscriptions = pricingSubscriptions.filter((sub: any) => {
      const subDate = new Date(sub.createdAt);
      return subDate.getMonth() === previousMonth && subDate.getFullYear() === previousYear;
    }).length;

    // Calculate growth percentage
    const monthlyGrowth = previousMonthSubscriptions > 0 
      ? ((currentMonthSubscriptions - previousMonthSubscriptions) / previousMonthSubscriptions * 100)
      : currentMonthSubscriptions > 0 ? 100 : 0;

    // Get recent activity (last 10 activities) with error handling
    const recentActivity = await Promise.all([
      // Recent newsletter subscriptions
      db.collection('newsletter_subscriptions')
        .find({})
        .sort({ subscribedAt: -1 })
        .limit(3)
        .toArray()
        .then((subs: any[]) => subs.map((sub: any) => ({
          id: sub._id,
          type: 'Newsletter',
          description: `New subscriber: ${sub.email}`,
          time: sub.subscribedAt,
          link: '/admin/newsletter'
        })))
        .catch(() => []),
      
      // Recent contact submissions
      db.collection('contact_submissions')
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray()
        .then((contacts: any[]) => contacts.map((contact: any) => ({
          id: contact._id,
          type: 'Contact',
          description: `New inquiry from ${contact.name || 'Anonymous'}`,
          time: contact.createdAt,
          link: '/admin/contacts'
        })))
        .catch(() => []),
      
      // Recent blog posts
      db.collection('blog_posts')
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray()
        .then((posts: any[]) => posts.map((post: any) => ({
          id: post._id,
          type: 'Blog',
          description: `New post: "${post.title}"`,
          time: post.createdAt,
          link: '/admin/blog'
        })))
        .catch(() => []),
      
      // Recent pricing subscriptions
      Promise.resolve(
        pricingSubscriptions
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((sub: any) => ({
            id: sub._id,
            type: 'Subscription',
            description: `New ${sub.packageType} subscription from ${sub.customerName}`,
            time: sub.createdAt,
            link: '/admin/pricing'
          }))
      )
    ]);

    // Flatten and sort recent activity by time
    const allRecentActivity = recentActivity.flat()
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    const stats = {
      totalSubscribers: newsletterSubscribers,
      totalContacts: contactSubmissions,
      totalBlogPosts: blogPosts,
      totalInstagramPosts: instagramPosts,
      totalTikTokVideos: tiktokVideos,
      totalFeaturedContent: featuredContent,
      totalRevenue,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100, // Round to 2 decimal places
      recentActivity: allRecentActivity,
      // Additional calculated metrics
      activeSubscriptions: pricingSubscriptions.filter((sub: any) => sub.status === 'active').length,
      pendingSubscriptions: pricingSubscriptions.filter((sub: any) => sub.status === 'pending').length,
      paidSubscriptions: pricingSubscriptions.filter((sub: any) => sub.paymentStatus === 'paid').length
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch dashboard statistics',
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}