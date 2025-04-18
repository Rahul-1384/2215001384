// TrendingPosts.jsx
import React from 'react';

const TrendingPosts = ({ users, posts, postComments }) => {
  // Get comment count for each post
  const getCommentCount = (postId) => {
    return postComments[postId]?.length || 0;
  };

  // Get posts sorted by comment count
  const getPostsSortedByComments = () => {
    return [...posts].sort((a, b) => getCommentCount(b.id) - getCommentCount(a.id));
  };

  // Generate random image for posts
  const getRandomImage = (seed) => {
    // Using seed to get consistent images for same post/user
    const width = 200 + (seed % 100);
    const height = 150 + (seed % 50);
    return `/api/placeholder/${width}/${height}`;
  };

  const trendingPosts = getPostsSortedByComments().slice(0, 5);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Trending Posts</h2>
      
      {trendingPosts.length > 0 ? (
        <div className="space-y-4">
          {trendingPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src={getRandomImage(parseInt(post.userId))} 
                    alt={users[post.userId]} 
                    className="object-cover"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-800">{users[post.userId]}</h3>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-gray-800">{post.content}</p>
                <div className="mt-2">
                  <img 
                    src={getRandomImage(parseInt(post.id))} 
                    alt="Post content" 
                    className="rounded-lg max-h-48 w-full object-cover"
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <span className="font-medium">{getCommentCount(post.id)} comments</span>
              </div>
              
              {postComments[post.id] && postComments[post.id].length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                  {postComments[post.id].slice(0, 2).map((comment) => (
                    <div key={comment.id} className="text-sm text-gray-600 mb-2 ml-2 p-2 bg-gray-50 rounded">
                      {comment.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 py-8 text-center">No trending posts available</div>
      )}
    </div>
  );
};

export default TrendingPosts;