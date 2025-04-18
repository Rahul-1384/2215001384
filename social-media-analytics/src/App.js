import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, TrendingUp, Rss } from 'lucide-react';
import TopUsers from './components/TopUsers';
import TrendingPosts from './components/TrendingPosts';
import Feed from './components/Feed';

// Change to relative URL path when using proxy
const API_PATH = 'http://20.244.56.144/evaluation-service';

const CLIENT_ID = '2aeb34f5-8bdf-4b92-b3d4-56aa724ba76f';
const CLIENT_SECRET = 'ugmgpwUwskrMkJyg';

const App = () => {
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState([]);
  const [postComments, setPostComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    getAuthToken();
  }, []);

  const getAuthToken = async () => {
    try {
      const tokenResponse = await fetch(`${API_PATH}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET
        })
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`HTTP error! Status: ${tokenResponse.status}`);
      }
      
      const tokenData = await tokenResponse.json();
      console.log(tokenData);
      
      if (tokenData.token || tokenData.access_token) {
        const accessToken = tokenData.token || tokenData.access_token;
        setToken(accessToken);
        fetchData(accessToken);
      } else {
        setError("Failed to authenticate. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("Authentication error. Please try again.");
      console.error("Auth error:", err);
      setLoading(false);
    }
  };

  const fetchData = async (authToken) => {
    if (!authToken && !token) {
      setError("No authentication token available.");
      setLoading(false);
      return;
    }

    const currentToken = authToken || token;
    
    setLoading(true);
    setError(null);
    setRefreshing(true);
    
    try {
      const requestOptions = {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      };

      const usersResponse = await fetch(`${API_PATH}/users`, requestOptions);
      
      if (usersResponse.status === 401) {
        getAuthToken();
        return;
      }
      
      if (!usersResponse.ok) {
        throw new Error(`HTTP error! Status: ${usersResponse.status}`);
      }
      
      const usersData = await usersResponse.json();
      setUsers(usersData.users);
      
      const allPosts = [];
      const userIds = Object.keys(usersData.users).slice(0, 5);
      
      for (const userId of userIds) {
        try {
          const postsResponse = await fetch(`${API_PATH}/users/${userId}/posts`, requestOptions);
          
          if (!postsResponse.ok) {
            console.warn(`Error fetching posts for user ${userId}: HTTP ${postsResponse.status}`);
            continue;
          }
          
          const postsData = await postsResponse.json();
          
          if (postsData.posts && postsData.posts.length > 0) {
            const postsWithUserInfo = postsData.posts.map(post => ({
              ...post,
              userName: usersData.users[userId].name
            }));
            
            allPosts.push(...postsWithUserInfo);
            
            // Fetch comments for each post in parallel
            const commentPromises = postsData.posts.map(post => 
              fetchComments(post.id, currentToken)
            );
            await Promise.all(commentPromises);
          }
        } catch (err) {
          console.error(`Error fetching posts for user ${userId}:`, err);
          // Continue with other users even if one fails
        }
      }
      
      setPosts(allPosts);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const fetchComments = async (postId, authToken) => {
    const currentToken = authToken || token;
    
    try {
      const commentsResponse = await fetch(`${API_PATH}/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (!commentsResponse.ok) {
        throw new Error(`HTTP error! Status: ${commentsResponse.status}`);
      }
      
      const commentsData = await commentsResponse.json();
      
      if (commentsData.comments) {
        setPostComments(prev => ({
          ...prev,
          [postId]: commentsData.comments
        }));
      }
      return commentsData.comments;
    } catch (err) {
      console.error(`Error fetching comments for post ${postId}:`, err);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-gray-800">Social Media Analytics</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto py-6 px-6">
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => fetchData()}
            disabled={loading || refreshing}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> 
            Refresh Data
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {!loading && (
          <>
            <nav className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center px-4 py-3 border-b-2 ${
                  activeTab === 'feed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                <Rss className="w-5 h-5 mr-2" />
                Feed
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex items-center px-4 py-3 border-b-2 ${
                  activeTab === 'trending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending Posts
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-4 py-3 border-b-2 ${
                  activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                <Users className="w-5 h-5 mr-2" />
                Top Users
              </button>
            </nav>
            
            {activeTab === 'feed' && <Feed users={users} posts={posts} postComments={postComments} />}
            {activeTab === 'trending' && <TrendingPosts users={users} posts={posts} postComments={postComments} />}
            {activeTab === 'users' && <TopUsers users={users} posts={posts} postComments={postComments} />}
          </>
        )}
      </main>
      
      <footer className="bg-white shadow-inner mt-8">
        <div className="max-w-4xl mx-auto py-4 px-6 text-center text-gray-500 text-sm">
          Social Media Analytics Dashboard - React Frontend
        </div>
      </footer>
    </div>
  );
};

export default App;