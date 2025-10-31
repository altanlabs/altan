#!/usr/bin/env python3
"""
Comprehensive MUI to shadcn Migration
Handles both imports and component usage patterns
"""

import re
from pathlib import Path

def migrate_file_comprehensive(filepath):
    """Migrate imports AND component usage"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Step 1: Remove multi-line MUI imports
    content = re.sub(
        r"import\s+{[^}]*}\s+from\s+['\"]@mui/material['\"];?\n?",
        '',
        content,
        flags=re.MULTILINE
    )
    content = re.sub(
        r"import\s+{[^}]*}\s+from\s+['\"]@mui/lab['\"];?\n?",
        '',
        content,
        flags=re.MULTILINE
    )
    
    # Step 2: Remove useTheme and styled imports
    content = re.sub(
        r"import\s+{[^}]*}\s+from\s+['\"]@mui/material/styles['\"];?\n?",
        '',
        content
    )
    
    # Step 3: Replace common sx patterns with className
    # Box with sx -> div with className
    content = re.sub(
        r'<Box\s+sx={{([^}]+)}}>',
        lambda m: f'<div className="">',
        content
    )
    content = re.sub(r'</Box>', '</div>', content)
    
    # Stack with sx -> div with flex
    content = re.sub(
        r'<Stack([^>]*)>',
        r'<div className="flex flex-col gap-2"\1>',
        content
    )
    content = re.sub(r'</Stack>', '</div>', content)
    
    # Typography variants -> semantic HTML
    content = re.sub(r'<Typography\s+variant="h1"([^>]*)>', r'<h1 className="text-4xl font-bold"\1>', content)
    content = re.sub(r'<Typography\s+variant="h2"([^>]*)>', r'<h2 className="text-3xl font-semibold"\1>', content)
    content = re.sub(r'<Typography\s+variant="h3"([^>]*)>', r'<h3 className="text-2xl font-semibold"\1>', content)
    content = re.sub(r'<Typography\s+variant="h4"([^>]*)>', r'<h4 className="text-xl font-semibold"\1>', content)
    content = re.sub(r'<Typography\s+variant="h5"([^>]*)>', r'<h5 className="text-lg font-semibold"\1>', content)
    content = re.sub(r'<Typography\s+variant="h6"([^>]*)>', r'<h6 className="text-base font-semibold"\1>', content)
    content = re.sub(r'<Typography\s+variant="body1"([^>]*)>', r'<p className="text-base"\1>', content)
    content = re.sub(r'<Typography\s+variant="body2"([^>]*)>', r'<p className="text-sm"\1>', content)
    content = re.sub(r'<Typography\s+variant="caption"([^>]*)>', r'<span className="text-xs text-muted-foreground"\1>', content)
    content = re.sub(r'<Typography([^>]*)>', r'<p\1>', content)
    content = re.sub(r'</Typography>', lambda m: '</p>' if '<p' in content else '</span>', content)
    
    # Only write if changed
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    src = Path('src')
    count = 0
    
    # Process all files
    for ext in ['**/*.jsx', '**/*.js']:
        for filepath in src.glob(ext):
            try:
                if migrate_file_comprehensive(filepath):
                    count += 1
                    if count % 50 == 0:
                        print(f"Processed {count} files...")
            except Exception as e:
                print(f"Error in {filepath}: {e}")
    
    print(f"\n✅ Migrated {count} files")

if __name__ == '__main__':
    main()

