# Testing Profile Picture Upload

## ⚠️ CRITICAL: Rebuild Required

The app needs a **full rebuild** because we added a new plugin. Here's how to test:

## 🔄 Steps to Rebuild and Test

### Option 1: For Development (Fastest)
```bash
# 1. Stop any running server (Ctrl+C in terminal)

# 2. Clear cache and restart
npx expo start --clear

# 3. Choose platform:
#    Press 'i' for iOS simulator
#    Press 'a' for Android emulator
#    Or scan QR code with Expo Go
```

### Option 2: For Physical Device
```bash
# 1. Stop any running server

# 2. For iOS device
npm run ios

# 3. For Android device  
npm run android
```

### Option 3: Full Rebuild (Most Reliable)
```bash
# 1. Stop server

# 2. Clear all caches
npx expo start --clear --reset-cache

# 3. If using Expo Go, reinstall app
```

## 🧪 Testing Steps

1. **Rebuild the app** using one of the methods above
2. Navigate to **Nurse Profile** screen
3. Click the **camera icon** on the profile picture
4. You should see an Alert with:
   - "Camera" option
   - "Gallery" option  
   - "Cancel" option
5. Choose **"Gallery"** (more reliable for testing)
6. Select a photo
7. You should see:
   - Success alert: "Profile picture updated!"
   - Image appears in profile picture
8. Navigate away and back - image should persist

## 🐛 Troubleshooting

### Nothing happens when clicking camera icon?
- **Check**: Did you rebuild the app?
- **Solution**: Stop server, run `npx expo start --clear`

### Alert shows but no options appear?
- **Check**: Console for errors
- **Solution**: May need full reinstall

### "Permission Required" error?
- **Grant**: Camera/Gallery permissions in device settings
- **Try**: Selecting Gallery first (easier permissions)

### Image doesn't persist?
- **Wait**: Make sure server finished rebuilding
- **Try**: Force close and reopen app

### Still not working?
Run this diagnostic:
```bash
# Check if expo-image-picker is installed
npm list expo-image-picker

# Should show something like: expo-image-picker@17.0.8
```

## 📱 Platform-Specific Notes

### iOS Simulator
- Camera: May not work in simulator
- Gallery: Works perfectly
- Use: Gallery option for testing

### Android Emulator
- Camera: May not work in emulator
- Gallery: Works perfectly
- Use: Gallery option for testing

### Physical Device
- Camera: Works great
- Gallery: Works great
- Both: Full functionality

## ✅ Expected Behavior

**When it's working correctly:**
1. ✅ Click camera icon → Alert appears
2. ✅ Choose Gallery → Permission prompt (first time)
3. ✅ Select photo → Image picker opens
4. ✅ Crop/adjust image
5. ✅ Success alert appears
6. ✅ Image displays immediately
7. ✅ Close and reopen app → Image still there

## 🔍 What Was Fixed

1. ✅ Immediate save after selection
2. ✅ Proper error handling
3. ✅ Success/error alerts
4. ✅ Plugin configuration added
5. ✅ Better null checking
6. ✅ Try-catch blocks for safety

## 💡 Quick Test Checklist

- [ ] App rebuilt with --clear flag
- [ ] Navigated to Nurse Profile
- [ ] Clicked camera icon
- [ ] Alert appeared with 3 options
- [ ] Selected Gallery option
- [ ] Permission granted (or already granted)
- [ ] Selected a photo
- [ ] Success alert shown
- [ ] Image displayed
- [ ] Image persists after app restart

## 📞 Still Issues?

If nothing works after rebuilding:
1. Check the console for error messages
2. Make sure you're testing on a device/emulator with camera/gallery
3. Try the web version: `npm run web` (will have limited functionality)
4. Verify expo-image-picker is in package.json dependencies

---

**Remember: The rebuild is ESSENTIAL for the plugin to work!**

