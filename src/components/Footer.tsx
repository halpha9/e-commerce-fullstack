import { CodeBracketIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function Footer() {
  return (
    <footer className="footer border-t border-base-300 bg-base-200 p-10 text-base-content">
      <div>
        <CodeBracketIcon width="50" height="50" />
        <p>
          <span className="footer-title">Alpha Industries Ltd.</span>
          <br />
          Providing wonderful code since 1999
        </p>
      </div>
      <div>
        <span className="footer-title">Services</span>
        <a className="link-hover link">Branding</a>
        <a className="link-hover link">Design</a>
        <a className="link-hover link">Marketing</a>
        <a className="link-hover link">Advertisement</a>
      </div>
      <div>
        <span className="footer-title">Company</span>
        <a className="link-hover link">About us</a>
        <a className="link-hover link">Contact</a>
        <a className="link-hover link">Jobs</a>
        <a className="link-hover link">Press kit</a>
      </div>
      <div>
        <span className="footer-title">Legal</span>
        <a className="link-hover link">Terms of use</a>
        <a className="link-hover link">Privacy policy</a>
        <a className="link-hover link">Cookie policy</a>
      </div>
    </footer>
  );
}
