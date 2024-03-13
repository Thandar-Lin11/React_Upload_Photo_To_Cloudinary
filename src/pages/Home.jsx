import React, { useState } from "react";
import { CloudinaryContext, Video } from "cloudinary-react";

const Home = () => {
  const [profileImage, setProfileImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const upload_preset = process.env.REACT_APP_UPLOAD_PRESET;
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  const resetForm = () => {
    setProfileImage("");
    setVideoUrl("");
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setProfileImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    try {
      // Upload video to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", upload_preset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to upload video: ${response.status}`);
      }

      const data = await response.json();
      setVideoUrl(data.secure_url);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageURL;

      if (
        profileImage &&
        (profileImage.type === "image/png" ||
          profileImage.type === "image/jpeg" ||
          profileImage.type === "image/jpg")
      ) {
        const image = new FormData();
        image.append("file", profileImage);
        image.append("cloud_name", cloudName);
        image.append("upload_preset", upload_preset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,

          {
            method: "POST",
            body: image,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to upload image: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        imageURL = responseData.url;
        resetForm();
      }

      alert(imageURL);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="home">
      <div className="container">
        <h2>Uploading Image and Video To Cloudinary</h2>
        <div className="card">
          <form onSubmit={uploadImage} className="--form-control">
            <label>Photo:</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              name="image"
              onChange={handleImageChange}
            />
            <label>Video:</label>
            <input type="file" accept="video/*" onChange={handleVideoChange} />
            <button
              type="submit"
              className="--btn --btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
          <div className="profile-photo">
            {imagePreview && <img src={imagePreview} alt="profileImg" />}
          </div>
          {videoUrl && (
            <CloudinaryContext cloudName={cloudName}>
              <Video publicId={videoUrl} controls width="300" crop="scale" />
            </CloudinaryContext>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
