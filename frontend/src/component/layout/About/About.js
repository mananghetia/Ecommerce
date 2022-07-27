import React from "react"
import "./AboutSection.css"
import { Button, Typography, Avatar } from "@material-ui/core"
import LinkedInIcon from "@material-ui/icons/LinkedIn"
import GitHub from "@material-ui/icons/GitHub"
const About = () => {
    const visitLinkedIn = () => {
        window.location = "https://www.linkedin.com/in/manan-ghetia/"
    }
    return (
        <div className="aboutSection">
            <div></div>
            <div className="aboutSectionGradient"></div>
            <div className="aboutSectionContainer">
                <Typography component="h1">About Us</Typography>
                <div>
                    <div>
                        <Avatar
                            style={{ width: "10vmax", height: "10vmax", margin: "2vmax 0" }}
                            src="./Profile.png"
                            alt="Founder"
                        />
                        <Typography>Manan Ghetia</Typography>
                        <Button onClick={visitLinkedIn} color="primary">
                            Visit LinkedIn
                        </Button>
                        <span>
                            This is a sample wesbite made by Manan Ghetia.
                        </span>
                    </div>
                    <div className="aboutSectionContainer2">
                        <Typography component="h2">Our Brands</Typography>
                        <a
                            href="https://github.com/mananghetia"
                            target="blank"
                        >
                            <GitHub className="GithubSvgIcon" />
                        </a>

                        <a href="https://www.linkedin.com/in/manan-ghetia/" target="blank">
                            <LinkedInIcon className="LinkedInSvgIcon" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About