"use client";
import Image from 'next/image';

interface NewsletterContent {
  subject: string;
  previewText: string;
  content: {
    hero: {
      title: string;
      subtitle: string;
      imageUrl?: string;
    };
    sections: Array<{
      type: 'text' | 'recipe' | 'tip' | 'story' | 'cta';
      title: string;
      content: string;
      imageUrl?: string;
      ctaText?: string;
      ctaUrl?: string;
    }>;
    footer: {
      message: string;
      socialLinks: Array<{
        platform: string;
        url: string;
      }>;
    };
  };
  tags: string[];
}

interface EmailTemplateProps {
  content: NewsletterContent;
  className?: string;
}

export function EmailTemplate({ content, className = '' }: EmailTemplateProps) {
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'recipe': return '🍳';
      case 'tip': return '💡';
      case 'story': return '📖';
      case 'cta': return '🎯';
      default: return '📝';
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'recipe': return 'bg-orange-50 border-orange-200';
      case 'tip': return 'bg-green-50 border-green-200';
      case 'story': return 'bg-purple-50 border-purple-200';
      case 'cta': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white ${className}`}>
      {/* Email Container */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-orange-500 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="https://queensmealgh.vercel.app/images/logo.jpeg"
              alt="Queen's Meal Logo"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Queen's Meal</h1>
          <p className="text-green-100 text-sm">Authentic Ghanaian Cuisine & Cooking</p>
        </div>

        {/* Hero Section */}
        <div className="relative">
          {content.content.hero.imageUrl && (
            <div className="h-64 bg-cover bg-center relative">
              <Image
                src={content.content.hero.imageUrl}
                alt="Newsletter Hero"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          )}
          <div className={`p-8 ${content.content.hero.imageUrl ? 'absolute inset-0 flex items-center justify-center' : ''}`}>
            <div className={`text-center ${content.content.hero.imageUrl ? 'text-white' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
                {content.content.hero.title}
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                {content.content.hero.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Sections */}
        <div className="p-6 space-y-8">
          {content.content.sections.map((section, index) => (
            <div key={index} className={`border-l-4 p-6 rounded-r-lg ${getSectionColor(section.type)}`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getSectionIcon(section.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {section.title}
                  </h3>
                  
                  {section.imageUrl && (
                    <div className="mb-4">
                      <Image
                        src={section.imageUrl}
                        alt={section.title}
                        width={400}
                        height={200}
                        className="rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                  
                  {section.type === 'cta' && section.ctaText && section.ctaUrl && (
                    <div className="mt-4">
                      <a
                        href={section.ctaUrl}
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        {section.ctaText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-8 text-center">
          <div className="mb-6">
            <Image
              src="https://queensmealgh.vercel.app/images/logo.jpeg"
              alt="Queen's Meal Logo"
              width={60}
              height={60}
              className="mx-auto rounded-full border-2 border-gray-300"
            />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">Queen's Meal</h3>
          <p className="text-gray-600 mb-4">
            {content.content.footer.message}
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-6">
            {content.content.footer.socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.platform === 'Instagram' && '📷'}
                {link.platform === 'TikTok' && '🎵'}
                {link.platform === 'Facebook' && '📘'}
                {link.platform === 'YouTube' && '📺'}
                {link.platform === 'Twitter' && '🐦'}
              </a>
            ))}
          </div>
          
          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Unsubscribe */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <p>
              You received this email because you subscribed to Queen's Meal newsletter.
            </p>
            <p className="mt-1">
              <a href="#" className="text-green-600 hover:text-green-700">
                Unsubscribe
              </a>
              {' | '}
              <a href="#" className="text-green-600 hover:text-green-700">
                Update Preferences
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// HTML Email Template for actual sending
export function generateHTMLEmailTemplate(content: NewsletterContent): string {
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'recipe': return '🍳';
      case 'tip': return '💡';
      case 'story': return '📖';
      case 'cta': return '🎯';
      default: return '📝';
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'recipe': return 'background-color: #fef3c7; border-left: 4px solid #f59e0b;';
      case 'tip': return 'background-color: #f0fdf4; border-left: 4px solid #10b981;';
      case 'story': return 'background-color: #faf5ff; border-left: 4px solid #8b5cf6;';
      case 'cta': return 'background-color: #eff6ff; border-left: 4px solid #3b82f6;';
      default: return 'background-color: #f9fafb; border-left: 4px solid #6b7280;';
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #059669, #ea580c);
            padding: 24px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid white;
            margin: 0 auto 16px;
            display: block;
        }
        .hero {
            position: relative;
            text-align: center;
            padding: 32px;
        }
        .hero-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 16px;
        }
        .section {
            margin: 24px 0;
            padding: 24px;
            border-radius: 0 8px 8px 0;
        }
        .section-icon {
            font-size: 24px;
            margin-right: 16px;
            display: inline-block;
            vertical-align: top;
        }
        .section-content {
            display: inline-block;
            width: calc(100% - 40px);
            vertical-align: top;
        }
        .cta-button {
            display: inline-block;
            background-color: #059669;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 16px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 32px;
            text-align: center;
        }
        .footer-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 2px solid #d1d5db;
            margin: 0 auto 16px;
            display: block;
        }
        .social-links {
            margin: 24px 0;
        }
        .social-link {
            display: inline-block;
            background-color: #059669;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            text-align: center;
            line-height: 40px;
            text-decoration: none;
            margin: 0 8px;
        }
        .tags {
            margin: 16px 0;
        }
        .tag {
            display: inline-block;
            background-color: #e5e7eb;
            color: #374151;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            margin: 2px;
        }
        .unsubscribe {
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
            margin-top: 16px;
        }
        .unsubscribe a {
            color: #059669;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="https://queensmealgh.vercel.app/images/logo.jpeg" alt="Queen's Meal Logo" class="logo">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Queen's Meal</h1>
            <p style="margin: 8px 0 0; color: #d1fae5; font-size: 14px;">Authentic Ghanaian Cuisine & Cooking</p>
        </div>

        <!-- Hero Section -->
        <div class="hero">
            ${content.content.hero.imageUrl ? `<img src="${content.content.hero.imageUrl}" alt="Newsletter Hero" class="hero-image">` : ''}
            <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: bold; color: #111827;">${content.content.hero.title}</h2>
            <p style="margin: 0; font-size: 18px; color: #6b7280;">${content.content.hero.subtitle}</p>
        </div>

        <!-- Newsletter Sections -->
        ${content.content.sections.map(section => `
            <div class="section" style="${getSectionColor(section.type)}">
                <div>
                    <span class="section-icon">${getSectionIcon(section.type)}</span>
                    <div class="section-content">
                        <h3 style="margin: 0 0 12px; font-size: 20px; font-weight: bold; color: #111827;">${section.title}</h3>
                        ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.title}" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 16px;">` : ''}
                        <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">${section.content.replace(/\n/g, '<br>')}</p>
                        ${section.type === 'cta' && section.ctaText && section.ctaUrl ? `<a href="${section.ctaUrl}" class="cta-button">${section.ctaText}</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('')}

        <!-- Footer -->
        <div class="footer">
            <img src="https://queensmealgh.vercel.app/images/logo.jpeg" alt="Queen's Meal Logo" class="footer-logo">
            <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: bold; color: #111827;">Queen's Meal</h3>
            <p style="margin: 0 0 24px; color: #6b7280;">${content.content.footer.message}</p>
            
            <div class="social-links">
                ${content.content.footer.socialLinks.map(link => `
                    <a href="${link.url}" class="social-link" target="_blank" rel="noopener noreferrer">
                        ${link.platform === 'Instagram' ? '📷' : 
                          link.platform === 'TikTok' ? '🎵' : 
                          link.platform === 'Facebook' ? '📘' : 
                          link.platform === 'YouTube' ? '📺' : 
                          link.platform === 'Twitter' ? '🐦' : '🔗'}
                    </a>
                `).join('')}
            </div>
            
            ${content.tags && content.tags.length > 0 ? `
                <div class="tags">
                    ${content.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            ` : ''}
            
            <div class="unsubscribe">
                <p style="margin: 0 0 8px;">You received this email because you subscribed to Queen's Meal newsletter.</p>
                <p style="margin: 0;">
                    <a href="#">Unsubscribe</a> | <a href="#">Update Preferences</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}