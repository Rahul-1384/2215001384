// TopUsers.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TopUsers = ({ users, posts, postComments }) => {
  // Get comment count for each post
  const getCommentCount = (postId) => {
    return postComments[postId]?.length || 0;
  };

  // Get top users with most commented posts
  const getTopUsers = () => {
    const userPostsMap = {};
    const userCommentCountMap = {};
    
    // Count comments for each user's posts
    posts.forEach(post => {
      const userId = post.userId;
      
      if (!userPostsMap[userId]) {
        userPostsMap[userId] = [];
      }
      
      userPostsMap[userId].push(post);
      
      const commentCount = getCommentCount(post.id);
      if (!userCommentCountMap[userId]) {
        userCommentCountMap[userId] = 0;
      }
      
      userCommentCountMap[userId] += commentCount;
    });
    
    // Convert to array and sort by total comment count
    const topUsers = Object.keys(userCommentCountMap)
      .map(userId => ({
        userId,
        userName: users[userId],
        commentCount: userCommentCountMap[userId]
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 5);
    
    return topUsers;
  };

  // Generate random image for posts
  const getRandomImage = (seed) => {
    // Using seed to get consistent images for same post/user
    const width = 200 + (seed % 100);
    const height = 150 + (seed % 50);
    return `/api/placeholder/${width}/${height}`;
  };

  const topUsers = getTopUsers();
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Top Users with Most Commented Posts</h2>
      
      {topUsers.length > 0 ? (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topUsers}>
              <XAxis dataKey="userName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="commentCount" fill="#8884d8" name="Comments" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-6 space-y-4">
            {topUsers.map((user) => (
              <div key={user.userId} className="flex items-center p-4 bg-white rounded-lg shadow">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src={getRandomImage(parseInt(user.userId))} 
                    alt={user.userName} 
                    className="object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-800">{user.userName}</h3>
                  <p className="text-gray-600">Total Comments: {user.commentCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-500 py-8 text-center">No user data available</div>
      )}
    </div>
  );
};

export default TopUsers;
