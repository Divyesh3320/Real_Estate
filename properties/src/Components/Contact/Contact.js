import React from 'react';

function Contact() {
  return (
    <>
      {/* Breadcumb Area */}
      <section className="breadcumb-area bg-img" style={{ backgroundImage: "url(img/bg-img/hero1.jpg)" }}>
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-12">
              <div className="breadcumb-content">
                <h3 className="breadcumb-title">Contact</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Breadcumb Area End */}

      <section className="south-contact-area section-padding-100">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="contact-heading">
                <h6>Contact info</h6>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-lg-4">
              <div className="content-sidebar">
                {/* Office Hours */}
                <div className="weekly-office-hours">
                  <ul>
                    <li className="d-flex align-items-center justify-content-between">
                      <span>Monday - Friday</span>
                      <span>09 AM - 19 PM</span>
                    </li>
                    <li className="d-flex align-items-center justify-content-between">
                      <span>Saturday</span>
                      <span>09 AM - 14 PM</span>
                    </li>
                    <li className="d-flex align-items-center justify-content-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </li>
                  </ul>
                </div>
                {/* Address */}
                <div className="address mt-30">
                  <h6><img src="img/icons/phone-call.png" alt="" /> +45 677 8993000 223</h6>
                  <h6><img src="img/icons/envelope.png" alt="" /> office@template.com</h6>
                  <h6><img src="img/icons/location.png" alt="" /> Main Str. no 45-46, b3, 56832,<br />Los Angeles, CA</h6>
                </div>
              </div>
            </div>

            {/* Contact Form Area */}
            <div className="col-12 col-lg-8">
              <div className="contact-form">
                <form action="#" method="post">
                  <div className="form-group">
                    <input type="text" className="form-control" name="text" id="contact-name" placeholder="Your Name" />
                  </div>
                  <div className="form-group">
                    <input type="number" className="form-control" name="number" id="contact-number" placeholder="Your Phone" />
                  </div>
                  <div className="form-group">
                    <input type="email" className="form-control" name="email" id="contact-email" placeholder="Your Email" />
                  </div>
                  <div className="form-group">
                    <textarea className="form-control" name="message" id="message" cols="30" rows="10" placeholder="Your Message"></textarea>
                  </div>
                  <button type="submit" className="btn south-btn">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      {/* <div className="map-area mb-100">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div id="googleMap" className="googleMap"></div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}

export default Contact;
