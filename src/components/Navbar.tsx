"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FaChevronDown, FaBars, FaXmark } from "react-icons/fa6";
import { programs } from "../data/programs";
import { useGymSettings } from "../data/gymData";
import { clientStorageKey } from "../data/clientPortal";

export default function Navbar() {
  const pathname = usePathname();
  const [content] = useGymSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check scroll position
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Check login state from localStorage — only show "My Dashboard" for active gym members
    const check = () => {
      const stored = window.localStorage.getItem(clientStorageKey);
      let isGymMember = false;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.package && parsed.package.key !== "none" && parsed.package.name !== "No Active Plan") {
            isGymMember = true;
          }
        } catch {}
      }
      const hasClicked = window.localStorage.getItem("hasClickedDashboard") === "true";
      setIsLoggedIn(isGymMember && hasClicked);
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  const isHomePage = pathname === "/";

  const links = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Programs", href: "/services#programs" },
    { label: "Gallery", href: "/gallery" },
    { label: "Membership", href: "/membership" },
    { label: "Shop", href: "/shop" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav
        className={`navbar${scrolled ? " navbarScrolled" : ""}${!isHomePage ? " navbarDark" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link className="brand" href="/" aria-label={`${content.gymName} home`}>
          <span>F</span>
          {content.gymName}
        </Link>

        {/* Desktop links */}
        <div className="navLinks" role="menubar">
          {links.map((link) => {
            const isProgramsLink = link.label === "Programs";
            const linkPath = link.href.split("#")[0];
            const isActive = isProgramsLink
              ? pathname === "/services" || pathname.startsWith("/programs/")
              : pathname === linkPath;

            if (link.label === "About Us") {
              return (
                <div className="navItem hasDropdown" key={link.label} role="none">
                  <Link
                    href={link.href}
                    className={isActive ? "active navDropdownTrigger" : "navDropdownTrigger"}
                    role="menuitem"
                    aria-haspopup="true"
                  >
                    {link.label} <FaChevronDown aria-hidden="true" />
                  </Link>
                  <div className="dropdownMenu" role="menu">
                    <Link href="/trainers" role="menuitem">Our Teams</Link>
                  </div>
                </div>
              );
            }

            if (isProgramsLink) {
              return (
                <div className="navItem hasDropdown" key={link.label} role="none">
                  <Link
                    href={link.href}
                    className={isActive ? "active navDropdownTrigger" : "navDropdownTrigger"}
                    role="menuitem"
                    aria-haspopup="true"
                  >
                    {link.label} <FaChevronDown aria-hidden="true" />
                  </Link>
                  <div className="dropdownMenu programDropdownMenu" role="menu">
                    {programs.map((program) => (
                      <Link href={`/programs/${program.slug}`} key={program.slug} role="menuitem">
                        {program.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                href={link.href}
                key={link.label}
                className={isActive ? "active" : ""}
                role="menuitem"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA & Hamburger */}
        <div className="navActions">
          <Link className="navButton" href={isLoggedIn ? "/client" : "/login"} id="nav-login-btn">
            {isLoggedIn ? "My Dashboard" : "Login"}
          </Link>
          <button
            className="navHamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobileNav" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobileNavInner">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`mobileNavLink${
                  link.label === "Programs"
                    ? pathname === "/services" || pathname.startsWith("/programs/")
                      ? " active"
                      : ""
                    : pathname === link.href.split("#")[0]
                      ? " active"
                      : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/trainers"
              className={`mobileNavLink${pathname === "/trainers" ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              Our Teams
            </Link>
            {programs.length > 0 && (
              <>
                <p className="mobileNavGroup">Programs</p>
                {programs.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/programs/${p.slug}`}
                    className={`mobileNavLink mobileNavSub${pathname === `/programs/${p.slug}` ? " active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {p.title}
                  </Link>
                ))}
              </>
            )}
            <Link
              href={isLoggedIn ? "/client" : "/login"}
              className="mobileNavCta"
              onClick={() => setMenuOpen(false)}
            >
              {isLoggedIn ? "My Dashboard" : "Login"}
            </Link>
            {!isLoggedIn && (
              <Link
                href="/join"
                className="mobileNavCtaSecondary"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
