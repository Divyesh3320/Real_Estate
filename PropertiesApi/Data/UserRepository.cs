using Microsoft.Data.SqlClient;
using System.Data;
using PropertiesApi.Models;

namespace PropertiesApi.Data
{
    public class UserRepository
    {
        private readonly IConfiguration _configuration;

        public UserRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetConnectionString()
        {
            return _configuration.GetConnectionString("ConnectionString");
        }

        public List<UserModel> GetAllUsers()
        {
            var users = new List<UserModel>();
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_users_selectall";

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        

                        while (reader.Read())
                        {
                            users.Add(new UserModel
                            {
                                UserId = reader.GetInt32("UserID"),
                                UserName = reader.GetString("UserName"),
                                Email = reader.GetString("Email"),
                                ContactNo = reader.IsDBNull(reader.GetOrdinal("ContactNo")) ? null : reader.GetString("ContactNo"),
                                Admin = reader.GetBoolean("Admin"),
                                CreatedDate = reader.GetDateTime("CreatedDate")
                            });
                        }
                    }
                }
            }
            return users;
        }

        public UserModel GetUserById(int userId)
        {
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_users_selectbyid";
                    command.Parameters.AddWithValue("@UserId", userId);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new UserModel
                            {
                                UserId = reader.GetInt32("UserId"),
                                UserName = reader.GetString("UserName"),
                                Email = reader.GetString("Email"),
                                ContactNo = reader.IsDBNull(reader.GetOrdinal("ContactNo")) ? null : reader.GetString("ContactNo"),
                                Admin = reader.GetBoolean("Admin"),
                                CreatedDate = reader.GetDateTime("CreatedDate")
                            };
                        }
                    }
                }
            }
            return null;
        }

        public bool InsertUser(UserModel user)
        {
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_users_insert";

                    command.Parameters.AddWithValue("@UserName", user.UserName);
                    command.Parameters.AddWithValue("@Email", user.Email);
                    command.Parameters.AddWithValue("@Password", user.Password);
                    command.Parameters.AddWithValue("@ContactNo", user.ContactNo ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Admin", user.Admin);

                    connection.Open();
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }

        public bool UpdateUser(UserUpdateModel user)
        {
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_users_update";

                    command.Parameters.AddWithValue("@UserId", user.UserId);
                    command.Parameters.AddWithValue("@UserName", user.UserName);
                    command.Parameters.AddWithValue("@Email", user.Email);
                    command.Parameters.AddWithValue("@ContactNo", user.ContactNo ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Admin", user.Admin);

                    connection.Open();
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }

        public bool DeleteUser(int userId)
        {
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_users_delete";
                    command.Parameters.AddWithValue("@UserId", userId);

                    connection.Open();
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }

        public UserModel LoginUser(string email, string password)
        {
            using (var connection = new SqlConnection(GetConnectionString()))
            {
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_users_login";
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", password);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new UserModel
                            {
                                UserId = reader.GetInt32("UserId"),
                                UserName = reader.GetString("UserName"),
                                Email = reader.GetString("Email"),
                                ContactNo = reader.IsDBNull(reader.GetOrdinal("ContactNo")) ? null : reader.GetString("ContactNo"),
                                Admin = reader.GetBoolean("Admin"),
                                CreatedDate = reader.GetDateTime("CreatedDate")
                            };
                        }
                    }
                }
            }
            return null;
        }
    }
}