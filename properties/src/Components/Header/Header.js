import { Link } from "react-router-dom";
function Header(){
    const user = JSON.parse(localStorage.getItem('user'));

    console.log(user);
    
    return(
        <>
        <style>
            {`
                .nav-link {
                    position: relative;
                    color: #333 !important;
                    font-weight: 500;
                    transition: color 0.3s ease;
                    padding: 0.5rem 1rem !important;
                }

                .nav-link:hover {
                    color: #007bff !important;
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 50%;
                    background-color: #007bff;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-link:hover::after {
                    width: 100%;
                }

                .btn-outline-secondary {
                    transition: all 0.3s ease;
                    border-radius: 20px;
                    padding: 8px 16px;
                }

                .btn-outline-secondary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .dropdown-item {
                    transition: all 0.2s ease;
                    padding: 8px 20px;
                }

                .dropdown-item:hover {
                    background-color: #f8f9fa;
                    padding-left: 25px;
                }

                .navbar-nav .nav-item {
                    margin: 0 5px;
                }

                .dropdown-menu {
                    border: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    margin-top: 10px;
                }

                .navbar {
                    padding: 15px 0;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-menu.show {
                    animation: fadeIn 0.3s ease;
                }

                .user-avatar {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background-color: #007bff;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .user-btn {
                    padding: 0;
                    border: none;
                    background: none;
                    transition: transform 0.3s ease;
                }

                .user-btn:hover {
                    transform: translateY(-2px);
                }
            `}
        </style>
        <header>
            {/* Top Header */}
            <div className="bg-dark text-white py-2">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <a href="mailto:contact@southtemplate.com" className="text-white text-decoration-none">
                                <i className="fa fa-envelope me-2"></i>
                                contact@southtemplate.com
                            </a>
                        </div>
                        <div className="col-md-6 text-end">
                            <a href="tel:+45 677 8993000 223" className="text-white text-decoration-none">
                                <i className="fa fa-phone me-2"></i>
                                +45 677 8993000 223
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <img src="img/core-img/logo.png" alt="Logo" height="40"/>
                    </Link>
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <div className="me-auto"></div>
                        
                        <ul className="navbar-nav align-items-center">
                            <li className="nav-item">
                                <Link className="nav-link fw-medium" to="/home">Home</Link>
                            </li>
                            
                            <li className="nav-item">
                                <Link className="nav-link fw-medium" to="/about">About Us</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link fw-medium" to="/properties">Properties</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-medium" to={user ? "/postproperty" : "/login"} >Post Property</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-medium" to="/contact">Contact</Link>
                            </li>

                           

                            <li className="nav-item ms-2">
                                <div className="dropdown">
                                    {user ? (
                                        <button 
                                            className="user-btn dropdown-toggle d-flex align-items-center" 
                                            type="button" 
                                            data-bs-toggle="dropdown"
                                        >
                                            <div className="user-avatar">
                                                {user?.userName ? user.userName.charAt(0) : 'U'}
                                            </div>
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
                                            type="button" 
                                            data-bs-toggle="dropdown"
                                        >
                                            <i className="fa fa-user me-2"></i>
                                            <span>Account</span>
                                        </button>
                                    )}
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        {user ? (
                                            <>
                                                <li>
                                                    <div className="dropdown-item text-muted">
                                                        Signed in as <strong>{user?.userName || 'User'}</strong>
                                                    </div>
                                                </li>
                                                <li><hr className="dropdown-divider"/></li>
                                                <li><Link className="dropdown-item" to="/user-profile">Profile</Link></li>
                                                <li><Link className="dropdown-item" to="/my-properties">My Properties</Link></li>
                                                <li><Link className="dropdown-item" to="/liked-properties">Liked Properties</Link></li>
                                                <li><hr className="dropdown-divider"/></li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item text-danger" 
                                                        onClick={() => {
                                                            localStorage.removeItem('user');
                                                            window.location.href = '/';
                                                        }}
                                                    >
                                                        Logout
                                                    </button>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li><Link className="dropdown-item" to="/login">Login</Link></li>
                                                <li><Link className="dropdown-item" to="/signup">Sign Up</Link></li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

         
        </header>
        </>
    )
}
export default Header;