
import React, { useState } from 'react';
import { UINode } from '../types';
import { 
  Search, Settings, User, Trash, Edit, Plus, Download, Upload, Send, Play, Info, 
  ShoppingCart, LogIn, LogOut, ArrowRight, ArrowLeft, Menu, X, Check, Sparkles,
  ChevronRight, ChevronLeft, AlertCircle, Home, Mail, Phone
} from 'lucide-react';

interface ArtifactRendererProps {
  node: UINode;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onMoveNode?: (draggedId: string, targetId: string, position: 'inside' | 'before' | 'after') => void;
}

const getSmartPlaceholder = (attributes?: Record<string, string>): string => {
  if (!attributes) return 'Enter value...';
  
  const type = attributes.type || '';
  const name = attributes.name || '';
  const lowerName = name.toLowerCase();

  if (type === 'email' || lowerName.includes('email')) return 'alice@example.com';
  if (type === 'password' || lowerName.includes('password')) return '••••••••';
  if (type === 'search' || lowerName.includes('search')) return 'Search...';
  if (type === 'tel' || lowerName.includes('phone')) return '+1 (555) 000-0000';
  if (type === 'url' || lowerName.includes('url') || lowerName.includes('website')) return 'https://example.com';
  if (type === 'date') return 'YYYY-MM-DD';
  if (type === 'number') return '0';
  if (lowerName.includes('name')) return 'Full Name';
  if (lowerName.includes('title')) return 'Enter title here';
  if (lowerName.includes('desc')) return 'Enter description...';
  if (lowerName.includes('mess')) return 'Type your message here...';
  
  return 'Enter text...';
};

const getSuggestedIcon = (text?: string): React.ReactNode | null => {
  if (!text) return null;
  const t = text.toLowerCase();
  
  const iconProps = { className: "w-4 h-4 opacity-80" };
  
  if (t.includes('search') || t.includes('find') || t.includes('browse')) return <Search {...iconProps} />;
  if (t.includes('setting') || t.includes('config') || t.includes('pref')) return <Settings {...iconProps} />;
  if (t.includes('user') || t.includes('profile') || t.includes('account')) return <User {...iconProps} />;
  if (t.includes('delete') || t.includes('remove') || t.includes('trash') || t.includes('clear')) return <Trash {...iconProps} />;
  if (t.includes('edit') || t.includes('change') || t.includes('update')) return <Edit {...iconProps} />;
  if (t.includes('add') || t.includes('create') || t.includes('new') || t.includes('plus')) return <Plus {...iconProps} />;
  if (t.includes('download') || t.includes('save') || t.includes('export')) return <Download {...iconProps} />;
  if (t.includes('upload') || t.includes('import')) return <Upload {...iconProps} />;
  if (t.includes('send') || t.includes('submit') || t.includes('message')) return <Send {...iconProps} />;
  if (t.includes('play') || t.includes('start') || t.includes('resume')) return <Play {...iconProps} />;
  if (t.includes('info') || t.includes('help') || t.includes('about')) return <Info {...iconProps} />;
  if (t.includes('cart') || t.includes('buy') || t.includes('shop') || t.includes('checkout')) return <ShoppingCart {...iconProps} />;
  if (t.includes('login') || t.includes('sign in')) return <LogIn {...iconProps} />;
  if (t.includes('logout') || t.includes('sign out')) return <LogOut {...iconProps} />;
  if (t.includes('next') || t.includes('continue') || t.includes('forward')) return <ArrowRight {...iconProps} />;
  if (t.includes('back') || t.includes('prev') || t.includes('return')) return <ArrowLeft {...iconProps} />;
  if (t.includes('menu') || t.includes('hamburger')) return <Menu {...iconProps} />;
  if (t.includes('close') || t.includes('cancel') || t.includes('stop')) return <X {...iconProps} />;
  if (t.includes('confirm') || t.includes('done') || t.includes('ok') || t.includes('apply')) return <Check {...iconProps} />;
  if (t.includes('alert') || t.includes('error') || t.includes('warning')) return <AlertCircle {...iconProps} />;
  if (t.includes('home') || t.includes('main')) return <Home {...iconProps} />;
  if (t.includes('mail') || t.includes('email') || t.includes('contact')) return <Mail {...iconProps} />;
  if (t.includes('call') || t.includes('phone')) return <Phone {...iconProps} />;
  
  // Default fallback for generic buttons if selected
  return <Sparkles {...iconProps} />;
};

const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ node, selectedId, onSelect, onMoveNode }) => {
  const { id, type, styles, content, attributes, children } = node;
  
  // Drag State
  const [isDragOver, setIsDragOver] = useState<'top' | 'bottom' | 'inside' | null>(null);

  const isSelected = selectedId === id;
  const isInteractive = !!onSelect; // If onSelect is provided, we are in Edit Mode
  const isVoid = ['img', 'input', 'hr', 'br', 'textarea'].includes(type);

  const handleClick = (e: React.MouseEvent) => {
    if (isInteractive) {
      e.stopPropagation();
      onSelect && onSelect(id);
    }
  };

  // DnD Handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!isInteractive) return;
    e.dataTransfer.setData('application/react-dnd-id', id);
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isInteractive || !onMoveNode) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    
    // Define zones: Top 20%, Bottom 20% -> Sibling reorder. Middle 60% -> Insert inside (if container).
    const isContainer = ['div', 'section', 'header', 'footer', 'ul', 'nav', 'card', 'form'].includes(type);
    
    if (offsetY < rect.height * 0.2) {
        setIsDragOver('top');
    } else if (offsetY > rect.height * 0.8) {
        setIsDragOver('bottom');
    } else if (isContainer) {
        setIsDragOver('inside');
    } else {
        setIsDragOver(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isInteractive || !onMoveNode) return;
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('application/react-dnd-id');
    if (draggedId && isDragOver) {
        let position: 'inside' | 'before' | 'after' = 'inside';
        if (isDragOver === 'top') position = 'before';
        if (isDragOver === 'bottom') position = 'after';
        
        onMoveNode(draggedId, id, position);
    }
    setIsDragOver(null);
  };

  // Styles construction
  const interactiveStyles = isInteractive 
    ? ' cursor-pointer hover:ring-2 hover:ring-cyan-500/50 hover:ring-inset hover:bg-cyan-500/5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ease-out will-change-transform' 
    : '';
  
  const selectionStyles = isSelected 
    ? ` ring-[2px] ring-cyan-400 ring-inset shadow-[inset_0_0_20px_rgba(34,211,238,0.2)] z-50 ${!isVoid ? 'relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-400/10 before:to-transparent before:pointer-events-none before:content-[""] before:rounded-[inherit] before:z-10' : ''}`
    : '';
  
  // Drag Feedback Styles
  let dragStyles = '';
  if (isDragOver === 'inside') dragStyles = ' bg-cyan-500/10 ring-2 ring-inset ring-cyan-500';
  if (isDragOver === 'top') dragStyles = ' border-t-4 border-cyan-500';
  if (isDragOver === 'bottom') dragStyles = ' border-b-4 border-cyan-500';
  
  // Ensure default styles include break-words to prevent overflow
  const defaultStyles = ' break-words overflow-hidden';

  const finalClassName = `${styles || ''} ${defaultStyles} ${interactiveStyles} ${selectionStyles} ${dragStyles} relative transition-all duration-300 ease-out`;

  // Safely extract potential unsafe attributes that cause React crashes (like style="string")
  // We ignore 'style' assuming styles are handled via Tailwind classes in `styles` prop.
  // We ignore 'class' to prevent duplicate/invalid attribute warnings.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { style, class: classNameAttr, ...safeAttributes } = attributes || {};

  const commonProps = {
    className: finalClassName,
    onClick: handleClick,
    draggable: isInteractive,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    ...safeAttributes,
  };

  // Render children recursively
  const renderedChildren = children?.map((child) => (
    <ArtifactRenderer 
        key={child.id} 
        node={child} 
        selectedId={selectedId} 
        onSelect={onSelect} 
        onMoveNode={onMoveNode}
    />
  ));

  // Element Rendering Logic
  if (type === 'img') {
    return <img {...commonProps} src={attributes?.src || 'https://picsum.photos/400/300'} alt={attributes?.alt || 'AI Generated'} />;
  }
  
  if (type === 'input') {
    const placeholderText = attributes?.placeholder || getSmartPlaceholder(attributes);
    // Ensure accessiblity if aria-label is missing
    const ariaLabel = attributes?.['aria-label'] || attributes?.name || placeholderText;
    return <input {...commonProps} placeholder={placeholderText} aria-label={ariaLabel} />;
  }
  
  if (type === 'textarea') {
    const placeholderText = attributes?.placeholder || getSmartPlaceholder(attributes);
    const ariaLabel = attributes?.['aria-label'] || attributes?.name || placeholderText;
    return <textarea {...commonProps} placeholder={placeholderText} aria-label={ariaLabel} />;
  }

  // Enhanced Button Rendering with Icons for Selected State
  if (type === 'button') {
    let iconNode = null;
    let iconPos: 'left' | 'right' = 'left';

    if (isSelected && content) {
        const lower = content.toLowerCase();
        // Determine position based on context (Next/Arrow usually go right)
        if (lower.includes('next') || lower.includes('right') || lower.includes('forward') || lower.includes('continue') || lower.includes('more')) {
            iconPos = 'right';
        }
        iconNode = getSuggestedIcon(content);
    }

    // If icon is present, ensure flex layout for alignment
    const buttonClasses = iconNode 
        ? `${commonProps.className} flex items-center justify-center gap-2`
        : commonProps.className;
    
    // Fallback aria-label for icon-only buttons if not provided
    const ariaLabel = attributes?.['aria-label'] || (!content ? 'Button' : undefined);
    // Add type="button" by default to prevent form submission unless specified
    const btnType = attributes?.type || 'button';

    return (
        <button {...commonProps} type={btnType as any} className={buttonClasses} aria-label={ariaLabel}>
            {iconPos === 'left' && iconNode}
            {content}
            {iconPos === 'right' && iconNode}
            {renderedChildren}
        </button>
    );
  }

  // Sanitize content to prevent rendering raw code or script tags if they slip through
  const safeContent = content ? content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : content;

  const SafeTag = (['div', 'section', 'header', 'footer', 'nav', 'article', 'aside', 'main', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a', 'ul', 'li', 'label', 'form'].includes(type) ? type : 'div') as React.ElementType;

  return (
    <SafeTag {...commonProps}>
      {/* We purposefully do not use dangerouslySetInnerHTML to prevent XSS/injection */}
      {content}
      {renderedChildren}
    </SafeTag>
  );
};

export default ArtifactRenderer;
