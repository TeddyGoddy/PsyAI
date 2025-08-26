import React from 'react';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
`;

// Removed top-level ProfileTitle to avoid duplication with page header

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 12px 0;
  padding: 8px 12px;
  background: ${props => props.theme.colors.neutral[50]};
  border-left: 4px solid ${props => props.theme.colors.primary};
  border-radius: 4px;
`;

const SectionContent = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 16px;
  padding: 0 12px;
  
  p {
    margin-bottom: 12px;
  }
  
  ul, ol {
    margin: 8px 0 12px 20px;
    
    li {
      margin-bottom: 6px;
      line-height: 1.6;
    }
  }
  
  strong {
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
  }
  
  em {
    font-style: italic;
    color: ${props => props.theme.colors.text.secondary};
  }
  
  .highlight {
    background: rgba(79, 209, 199, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 600;
  }
  
  .numbered-item {
    margin-bottom: 12px;
    padding-left: 8px;
    line-height: 1.6;
  }
  
  .section-break {
    margin-bottom: 24px;
  }
`;

const ProfileRenderer = ({ content }) => {
  if (!content) return null;

  const formatText = (text) => {
    console.log('Original text:', text);
    
    // Convert **text** to <strong>
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to <em> (avoid conflicts with **)
    text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

    // Normalize and convert LLM artifacts like "numbered-item-1." or "numbered item: 1."
    text = text.replace(/^\s*numbered[-_ ]?item[:>\-]?\s*(\d+)\.\s*(.+)$/gm, "<div class='numbered-item'><strong>$1.</strong> $2</div>");
    // If there are stray prefixes without the number on the same line, strip them
    text = text.replace(/^\s*numbered[-_ ]?item[:>\-]?\s*/gm, '');

    // Convert numbered lists (1. 2. 3.) - use proper HTML structure
    text = text.replace(/^(\d+)\.\s*(.+)$/gm, "<div class='numbered-item'><strong>$1.</strong> $2</div>");
    
    // Convert bullet points starting with *
    text = text.replace(/^\*\s*(.+)$/gm, '<li>$1</li>');
    
    // Convert bullet points starting with -
    text = text.replace(/^-\s*(.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive <li> items in <ul>
    const lines = text.split('\n');
    let inList = false;
    let result = [];
    
    for (let line of lines) {
      if (line.includes('<li>')) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        result.push(line);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push(line);
      }
    }
    
    if (inList) {
      result.push('</ul>');
    }
    
    text = result.join('\n');
    
    // Highlight important terms in quotes
    text = text.replace(/"([^"]+)"/g, '<span class="highlight">$1</span>');
    
    console.log('Formatted text:', text);
    return text;
  };

  const renderMarkdown = (text) => {
    // Split by sections (## headers)
    const sections = text.split(/^## /gm).filter(Boolean);
    
    return sections.map((section, index) => {
      const lines = section.split('\n');
      const title = lines[0].replace(/^\d+\.\s*/, ''); // Remove numbering
      const content = lines.slice(1).join('\n').trim();
      
      return (
        <div key={index} className="section-break">
          <SectionTitle>{title}</SectionTitle>
          <SectionContent>
            {content.split('\n\n').map((paragraph, pIndex) => {
              const formattedText = formatText(paragraph.trim());
              return (
                <div 
                  key={pIndex} 
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                  style={{ marginBottom: '16px' }}
                />
              );
            })}
          </SectionContent>
        </div>
      );
    });
  };

  // Check if content has markdown structure
  const hasMarkdownStructure = content.includes('##') || content.includes('#');
  
  if (hasMarkdownStructure) {
    // Strip main title if present; rely on page header instead
    const contentWithoutTitle = content.replace(/^# .+$/m, '').trim();
    return (
      <ProfileContainer>
        {renderMarkdown(contentWithoutTitle)}
      </ProfileContainer>
    );
  }

  // Fallback for plain text with formatting
  return (
    <ProfileContainer>
      <SectionContent>
        {content.split('\n\n').map((paragraph, index) => {
          const formattedText = formatText(paragraph.trim());
          return (
            <div 
              key={index} 
              dangerouslySetInnerHTML={{ __html: formattedText }}
            />
          );
        })}
      </SectionContent>
    </ProfileContainer>
  );
};

export default ProfileRenderer;
