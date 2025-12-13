"""
Cloudinary URL Helper for TechGuro Seeders
"""

import os
import cloudinary
import cloudinary.api
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Cloudinary URL and parse it
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")

if not CLOUDINARY_URL:
    print("⚠️ ERROR: CLOUDINARY_URL not found in environment variables!")
    print("   Make sure your .env file has: CLOUDINARY_URL=cloudinary://...")
    CLOUD_NAME = "ddnf1lqu6"
else:
    # Parse CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
    try:
        url_without_protocol = CLOUDINARY_URL.replace("cloudinary://", "")
        credentials, CLOUD_NAME = url_without_protocol.split("@")
        api_key, api_secret = credentials.split(":")
        
        # Configure Cloudinary with explicit parameters
        cloudinary.config(
            cloud_name=CLOUD_NAME,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        
        print(f"✅ Cloudinary configured: {CLOUD_NAME}")
        
    except Exception as e:
        print(f"⚠️ ERROR parsing CLOUDINARY_URL: {e}")
        CLOUD_NAME = "ddnf1lqu6"

# Cache to store all Cloudinary resources (fetched once at startup)
_resource_cache = {}
_cache_initialized = False
_missing_images = set()  # Track missing images to avoid repeated warnings


def initialize_cache():
    """
    Fetch all resources from Cloudinary once and cache them.
    This is called automatically on first use.
    """
    global _resource_cache, _cache_initialized
    
    if _cache_initialized:
        return
    
    print("🔄 Initializing Cloudinary resource cache...")
    
    try:
        next_cursor = None
        total_resources = 0
        
        while True:
            if next_cursor:
                result = cloudinary.api.resources(
                    type="upload",
                    max_results=500,
                    next_cursor=next_cursor
                )
            else:
                result = cloudinary.api.resources(
                    type="upload",
                    max_results=500
                )
            
            resources = result.get('resources', [])
            
            for resource in resources:
                public_id = resource['public_id']
                secure_url = resource['secure_url']
                
                # Store in cache with the base filename as key
                filename_parts = public_id.split('/')[-1]
                base_name = filename_parts.split('_')[0]
                
                # Store multiple ways for flexible lookup
                _resource_cache[public_id] = secure_url
                _resource_cache[base_name] = secure_url
                _resource_cache[filename_parts] = secure_url
            
            total_resources += len(resources)
            
            next_cursor = result.get('next_cursor')
            if not next_cursor:
                break
        
        print(f"✅ Cached {total_resources} resources from Cloudinary")
        _cache_initialized = True
        
    except Exception as e:
        print(f"❌ Error initializing Cloudinary cache: {e}")
        print("   Seeding will continue but images may not load correctly.")
        _cache_initialized = True


def get_cloudinary_url(folder: str, filename: str, allow_empty: bool = True) -> str:
    """
    Get actual Cloudinary URL for an image by looking it up in the cache.
    
    Args:
        folder: Folder name (for organization only)
        filename: Image filename (e.g., 'python.png', 'first_steps.png')
        allow_empty: If True, return "" for missing images. If False, raise error.
    
    Returns:
        Full Cloudinary URL with version and unique ID, or empty string if not found
    """
    if not filename:
        return ""
    
    if filename.startswith("http"):
        return filename
    
    # Initialize cache on first use
    if not _cache_initialized:
        initialize_cache()
    
    # Remove file extension
    base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
    
    # Try to find in cache
    url = None
    
    # Try exact base name first
    if base_name in _resource_cache:
        url = _resource_cache[base_name]
    else:
        # Try to find by searching for resources that start with this name
        for key, value in _resource_cache.items():
            if key.startswith(base_name) or base_name in key:
                url = value
                break
    
    if url:
        return url
    
    # Image not found
    if filename not in _missing_images:
        print(f"⚠️ Warning: Image not found in Cloudinary: {filename} (expected in {folder}/)")
        _missing_images.add(filename)
    
    if allow_empty:
        return ""  # Return empty string for missing images
    else:
        raise FileNotFoundError(f"Image not found in Cloudinary: {filename}")


def add_image_path(filename: str, folder: str) -> str:
    """
    Wrapper function for backward compatibility with existing seeders.
    Returns empty string for missing images instead of breaking.
    """
    if not filename:
        return ""
    
    if filename.startswith("http"):
        return filename
    
    # Clean up filename
    filename = filename.lstrip("/")
    if filename.startswith("images/"):
        filename = filename[7:]
    
    # Remove folder prefix if present
    for folder_name in ['course_icons', 'assessment_quizzes', 'assessments_quizzes', 
                        'lessons', 'milestones', 'profile_icons']:
        if filename.startswith(f"{folder_name}/"):
            filename = filename[len(folder_name)+1:]
            break
    
    return get_cloudinary_url(folder, filename, allow_empty=True)


# Convenience functions
def course_icon_url(filename: str) -> str:
    return get_cloudinary_url('course_icons', filename, allow_empty=True)


def lesson_image_url(filename: str) -> str:
    return get_cloudinary_url('lessons', filename, allow_empty=True)


def assessment_image_url(filename: str) -> str:
    return get_cloudinary_url('assessment_quizzes', filename, allow_empty=True)


def milestone_icon_url(filename: str) -> str:
    return get_cloudinary_url('milestones', filename, allow_empty=True)


def profile_icon_url(filename: str) -> str:
    return get_cloudinary_url('profile_icons', filename, allow_empty=True)


def print_missing_images_summary():
    """Print a summary of all missing images at the end of seeding"""
    if _missing_images:
        print("\n" + "="*60)
        print(f"⚠️  MISSING IMAGES SUMMARY ({len(_missing_images)} files)")
        print("="*60)
        print("The following images were referenced but not found in Cloudinary:")
        for img in sorted(_missing_images):
            print(f"  • {img}")
        print("\nThese images will show as broken/empty in the app.")
        print("Upload them to Cloudinary to fix this.")
        print("="*60 + "\n")


# Test function
if __name__ == "__main__":
    print("Testing Cloudinary Helper:")
    print(f"Cloud Name: {CLOUD_NAME}\n")
    
    initialize_cache()
    
    print("\n=== Testing URL Lookups ===")
    test_files = [
        ('milestones', 'first_steps.png'),
        ('course_icons', 'course_img1.png'),
        ('lessons', 'Tekis_Summary.png'),
        ('course_icons', 'nonexistent.png'),  # Test missing image
    ]
    
    for folder, filename in test_files:
        url = get_cloudinary_url(folder, filename)
        status = "✅" if url else "❌"
        print(f"{status} {folder}/{filename}")
        if url:
            print(f"  → {url}\n")
    
    print_missing_images_summary()