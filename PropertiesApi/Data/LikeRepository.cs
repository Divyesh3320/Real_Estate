using Microsoft.Data.SqlClient;
using System.Data;
using PropertiesApi.Models;

namespace PropertiesApi.Data
{
    public class LikeRepository
    {
        private readonly IConfiguration _configuration;
    
        public LikeRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetConnectionString()
        {
            return _configuration.GetConnectionString("ConnectionString");
        }

        public List<LikeModel> GetAllLikes()
        {
            var likes = new List<LikeModel>();
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_likes_selectall";

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            likes.Add(new LikeModel
                            {
                                LikeID = reader.GetInt32("LikeID"),
                                UserID = reader.GetInt32("UserID"),
                                PropertyID = reader.GetInt32("PropertyID"),
                                LikedAt = reader.GetDateTime("LikedAt")
                            });
                        }
                    }
                }
            }
            return likes;
        }

        public List<LikeModel> GetLikesByUser(int userId)
        {
            var likes = new List<LikeModel>();
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_likes_selectbyuser";
                    command.Parameters.AddWithValue("@UserID", userId);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            likes.Add(new LikeModel
                            {
                                LikeID = reader.GetInt32("LikeID"),
                                UserID = reader.GetInt32("UserID"),
                                PropertyID = reader.GetInt32("PropertyID"),
                                LikedAt = reader.GetDateTime("LikedAt")
                            });
                        }
                    }
                }
            }
            return likes;
        }

        public List<LikeModel> GetLikesByProperty(int propertyId)
        {
            var likes = new List<LikeModel>();
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_likes_selectbyproperty";
                    command.Parameters.AddWithValue("@PropertyID", propertyId);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            likes.Add(new LikeModel
                            {
                                LikeID = reader.GetInt32("LikeID"),
                                UserID = reader.GetInt32("UserID"),
                                PropertyID = reader.GetInt32("PropertyID"),
                                LikedAt = reader.GetDateTime("LikedAt")
                            });
                        }
                    }
                }
            }
            return likes;
        }

        public bool InsertLike(LikeModel like)
        {
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_likes_insert";

                    command.Parameters.AddWithValue("@UserID", like.UserID);
                    command.Parameters.AddWithValue("@PropertyID", like.PropertyID);

                    try
                    {
                        connection.Open();
                        return command.ExecuteNonQuery() > 0;
                    }
                    catch (SqlException ex)
                    {
                        if (ex.Number == 2627) // Unique constraint violation
                        {
                            return false;
                        }
                        throw;
                    }
                }
            }
        }

        public bool DeleteLike(int userId, int propertyId)
        {
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_likes_delete";
                    command.Parameters.AddWithValue("@UserID", userId);
                    command.Parameters.AddWithValue("@PropertyID", propertyId);

                    connection.Open();
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }
    }
}