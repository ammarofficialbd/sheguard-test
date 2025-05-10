/**
 * Upload an image to a storage service
 * In a real application, this would upload to a service like AWS S3, Cloudinary, etc.
 * For this example, we'll simulate the upload and return a placeholder URL
 *
 * @param file File to upload
 * @returns URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  // In a real application, you would upload the file to a storage service
  // For this example, we'll just return a placeholder URL

  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Generate a random ID for the file
  const fileId = Math.random().toString(36).substring(2, 15)

  // Return a placeholder URL
  return `https://storage.sheguard.app/uploads/${fileId}-${file.name}`
}
