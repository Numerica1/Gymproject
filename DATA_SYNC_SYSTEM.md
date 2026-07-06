# Real-Time Data Synchronization System

## Overview
The Fitness Bhaktapur website uses a real-time data synchronization system that automatically updates the public site whenever an admin makes changes from the admin panel.

## How It Works

### 1. Data Storage
All gym data is stored in the browser's **localStorage** with specific keys:
- `fitness-bhaktapur-shared-content` - Settings (home content, membership plans, etc.)
- `fitness-bhaktapur-trainers-list` - Trainers information
- `fitness-bhaktapur-blogs-list` - Blog posts
- `fitness-bhaktapur-clients-list` - Client/member list
- `fitness-bhaktapur-payments-list` - Payment transactions
- `fitness-bhaktapur-products-list` - Shop products
- `fitness-bhaktapur-offers-list` - Coupons and offers
- `fitness-bhaktapur-orders-list` - Shop orders
- `fitness-bhaktapur-reviews-list` - Product reviews
- `fitness-bhaktapur-attendance-list` - Attendance logs
- `fitness-bhaktapur-classes-list` - Class schedules
- `fitness-bhaktapur-bookings-list` - Booking data

### 2. Event-Based Updates
When data is updated, the system dispatches a custom event: `fitness-bhaktapur-data-changed`

**Flow:**
```
Admin Panel → setSettings/setTrainers/etc → localStorage
    ↓
Dispatch GYM_DATA_CHANGED_EVENT
    ↓
All components listening to this event are notified
    ↓
Components re-render with new data
```

### 3. React Hooks System
Each data type has a custom hook:

```typescript
export function useGymSettings() {
  return useGymState<SharedGymContent>(GYM_SETTINGS_KEY, defaultGymContent);
}

export function useGymTrainers() {
  return useGymState<Trainer[]>(GYM_TRAINERS_KEY, defaultTrainers);
}

export function useGymBlogs() {
  return useGymState<BlogPost[]>(GYM_BLOGS_KEY, blogPosts);
}
// ... and more hooks
```

### 4. Public Components Using These Hooks
The following public pages and components automatically update when data changes:

#### Settings/Content Updates
- **Navbar** - Uses `useGymSettings()` for navigation and social links
- **Footer** - Uses `useGymSettings()` for contact info and links
- **ContactForm** - Uses `useGymSettings()` for contact details
- **FloatingWidgets** - Uses `useGymSettings()` for WhatsApp/chat links
- **CTA** - Uses `useGymSettings()` for call-to-action text
- **Membership Plans** - Uses `useGymSettings()` for pricing and plans

#### Trainers Updates
- **Trainers Page** - Uses `useGymTrainers()` to display all trainers
- Any page showing trainer information

#### Blog Updates
- **Blog Page** - Uses `useGymBlogs()` to display all blogs
- **Blog Detail Page** - Uses `useGymBlogs()` to fetch individual posts

#### Clients Updates
- **Client Portal** - Uses `useGymClients()` to verify login
- **Client Login** - Uses `useGymClients()` for authentication

## Admin Panel Updates

The AdminPanel component has full control to update all data:

### Settings Section
```typescript
const [settings, setSettings] = useGymSettings();
// When admin saves settings:
setSettings({...settings, newData});
```

### Trainers Section
```typescript
const [trainers, setTrainers] = useGymTrainers();
// When admin adds/edits/deletes:
setTrainers([...trainers, newTrainer]);
setTrainers(trainers.map(t => t.name === name ? updated : t));
setTrainers(trainers.filter(t => t.name !== name));
```

### Blogs Section
```typescript
const [blogs, setBlogs] = useGymBlogs();
// When admin adds/edits/deletes:
setBlogs([newBlog, ...blogs]);
setBlogs(blogs.map(b => b.slug === slug ? updated : b));
setBlogs(blogs.filter(b => b.slug !== slug));
```

## Real-Time Sync Mechanics

### How Updates Reach Other Tabs
1. Admin makes change in tab 1 and clicks save
2. `setStorageItem()` is called which:
   - Updates localStorage
   - Dispatches `GYM_DATA_CHANGED_EVENT` 
   - Dispatches StorageEvent for cross-tab communication
3. Tabs listening with `useGymState()` hook receive the event
4. `handleRefresh()` is triggered → `setState(getStorageItem(key, seed))`
5. Components re-render with new data

### Event Listeners in useGymState
```typescript
useEffect(() => {
  const handleRefresh = () => {
    setState(getStorageItem(key, seed));
  };

  window.addEventListener("storage", handleRefresh);              // Cross-tab sync
  window.addEventListener(GYM_DATA_CHANGED_EVENT, handleRefresh); // Same-tab sync

  return () => {
    window.removeEventListener("storage", handleRefresh);
    window.removeEventListener(GYM_DATA_CHANGED_EVENT, handleRefresh);
  };
}, [key, seed]);
```

## Testing the System

### To verify updates work:
1. Open the admin panel in one browser tab (at `/admin`)
2. Open the public site in another tab (at `/`, `/trainers`, `/blog`, etc.)
3. In the admin panel:
   - Update gym settings (e.g., phone number in Settings section)
   - Add/edit/delete trainers
   - Add/edit/delete blog posts
4. Watch the public site automatically update in real-time

### Example: Update Trainer
1. Go to Admin Panel → Trainers
2. Edit or add a trainer
3. Click save
4. Go to public `/trainers` page → will show updated trainer info immediately

### Example: Update Settings
1. Go to Admin Panel → Settings
2. Change phone number or membership pricing
3. Click save
4. Check Footer (phone number) or Membership page (pricing) → updated instantly

## Data Structure Examples

### SharedGymContent (Settings)
```typescript
{
  companyName: "Fitness Bhaktapur",
  companyPhone: "+977 9876543210",
  companyEmail: "info@fitnessbhaktapur.com",
  companyAddress: "Bhaktapur, Nepal",
  companyLogo: {...},
  socialLinks: {...},
  membershipPlans: [...],
  // ... more fields
}
```

### Trainer
```typescript
{
  name: "Aarav Shrestha",
  specialty: "Strength and muscle gain",
  clients: "25 clients",
  image: "/images/group-training.jpg",
  category: "Trainers"
}
```

### BlogPost
```typescript
{
  title: "...",
  slug: "...",
  excerpt: "...",
  content: "...",
  publishedAt: "...",
  featured: true/false
}
```

## Files Involved

- **Data Layer**: `src/data/gymData.ts` - Contains hooks and sync logic
- **Admin Panel**: `src/components/AdminPanel.tsx` - Admin UI to manage data
- **Public Components**: All components in `src/components/` use the hooks
- **Storage**: Browser localStorage (persists across sessions)

## Advantages

✅ **Real-time updates** - Changes visible immediately  
✅ **Cross-tab sync** - Updates in one tab appear in others  
✅ **No backend needed** - Works with localStorage  
✅ **Automatic** - No manual refresh needed  
✅ **Simple to extend** - Easy to add new data types  

## Limitations & Future Improvements

⚠️ **Current**: Data is stored in localStorage (not persistent across devices)
💡 **Future**: Connect to a database backend to sync across all users' devices

⚠️ **Current**: Works within same browser  
💡 **Future**: Add WebSocket support for cross-device real-time sync

## Troubleshooting

### Changes not showing up?
1. Check browser console for errors
2. Verify localStorage is enabled
3. Clear cache and reload
4. Check that component is using the correct hook

### Event not firing?
1. Verify `setStorageItem()` is being called
2. Check browser's Storage event permissions
3. Verify event name matches: `fitness-bhaktapur-data-changed`
