import os
import re

svg_path = r"c:\Users\MoutsimFX\Downloads\W.svg"
logo_tsx_path = r"f:\Codezilla\مشاريعي\Waqt web\salahsync-days-main\src\components\Logo.tsx"

with open(svg_path, "r", encoding="utf-8") as f:
    svg_content = f.read()

# Modify SVG content
# 1. Replace #ffffff with currentColor
svg_content = svg_content.replace('fill="#ffffff"', 'fill="currentColor"')

# 2. Remove fixed width/height from svg tag
svg_content = re.sub(r'width="\d+"', '', svg_content, count=1)
svg_content = re.sub(r'height="\d+"', '', svg_content, count=1)

# 3. Inject className into svg tag
# We'll replace <svg with <svg className={cn("", className)}
# Note: The original svg tag has attributes we want to keep (viewBox, etc)
# But we need to make it JSX compatible?
# SVG attributes in JSX: xmlns:xlink -> xmlnsXlink (React specific?) 
# Actually, modern React supports most attributes, but namespaces might need care.
# However, for simple usage, let's just inject the className.
svg_content = svg_content.replace('<svg ', '<svg className={cn("h-6 w-auto", className)} ', 1)

# 4. Remove xml declaration if present (?xml...)
svg_content = re.sub(r'<\?xml.*?\?>', '', svg_content)

# 5. Fix common React SVG attribute issues if necessary
# The SVG contains xlink:href. React supports xlinkHref/href. 
# But let's check if we need to convert.
svg_content = svg_content.replace('xmlns:xlink', 'xmlnsXlink') # React camelCase? No, xmlns:xlink usually invalid in JSX? 
# Actually, 'xmlns:xlink' works in React 16+ usually but produces warning? 
# Let's simple try to replace xlink:href="data..." with href="data..." as xlink is deprecated anyway
# But wait, image tag needs href. 
svg_content = svg_content.replace('xlink:href=', 'href=')
svg_content = svg_content.replace('xmlns:xlink="http://www.w3.org/1999/xlink"', '') # Remove namespace declaration if unused

# 6. Construct Logo.tsx content
tsx_content = f"""import {{ cn }} from '@/lib/utils';

interface LogoProps {{
  className?: string;
}}

export function Logo({{ className }}: LogoProps) {{
  return (
    {svg_content}
  );
}}
"""

with open(logo_tsx_path, "w", encoding="utf-8") as f:
    f.write(tsx_content)

print("Logo.tsx updated successfully.")
