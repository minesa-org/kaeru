gsap.registerPlugin(ScrollTrigger);
gsap.set(
	".title, .header__brand, .header__right a, .button-primary, .button-primary .label-wrapper .text, .label__title, .label__count, .label__text, .features h2, .feature-item h3, .feature-item p, .feature-item li, .tools_section article h2, .tools_section article p, .additional_features_list li, footer .social-links a, footer .big-text, .hero__image, .sticker, .feature-item, .leaf",
	{ opacity: 0 },
);

function animateTextWithWheelEffect() {
	const textElements = document.querySelectorAll(
		".title, .header__brand, .header__right a, .button-primary, .button-primary .label-wrapper .text, .label__title, .label__count, .label__text, .features h2, .feature-item h3, .feature-item p, .feature-item li, .tools_section article h2, .tools_section article p, .additional_features_list li, footer .social-links a, footer .big-text",
	);

	textElements.forEach((element) => {
		if (
			element.matches(".button-primary") ||
			element.matches(".button-primary .label-wrapper .text")
		) {
			gsap.to(element, {
				opacity: 1,
				rotateX: 0,
				y: 0,
				scale: 1,
				duration: 0.8,
				ease: "power3.out",
				stagger: 0.05,
				delay: 0.3,
			});
		} else {
			gsap.to(element, {
				opacity: 1,
				rotateX: 0,
				y: 0,
				duration: 1,
				ease: "power3.out",
				stagger: 0.1,
				delay: 0.2,
			});
		}
	});
}

function animateElementsWithBlur() {
	const elementsToBlur = document.querySelectorAll(
		".hero__image, .sticker, .feature-item, .tools_section article, .additional_features_list li, .leaf",
	);

	elementsToBlur.forEach((element) => {
		if (element.matches(".tools_section article")) {
			const articleChildren = element.querySelectorAll("h2, p");
			articleChildren.forEach((child) => {
				gsap.to(child, {
					opacity: 1,
					filter: "blur(0px)",
					duration: 1.2,
					ease: "power2.out",
					scrollTrigger: {
						trigger: element,
						start: "top 80%",
						end: "top 20%",
						scrub: 1,
						toggleActions: "play none none reverse",
					},
				});
			});
		} else {
			gsap.to(element, {
				opacity: 1,
				filter: "blur(0px)",
				duration: 1.2,
				ease: "power2.out",
				scrollTrigger: {
					trigger: element,
					start: "top 80%",
					end: "top 20%",
					scrub: 1,
					toggleActions: "play none none reverse",
				},
			});
		}
	});

	const socialLinks = document.querySelectorAll("footer .social-links a");
	socialLinks.forEach((link) => {
		gsap.to(link, {
			opacity: 1,
			filter: "blur(0px)",
			duration: 1,
			ease: "power2.out",
			scrollTrigger: {
				trigger: "footer",
				start: "top 90%",
				end: "top 10%",
				scrub: 1,
				toggleActions: "play none none none",
			},
		});
	});
}

document.addEventListener("DOMContentLoaded", () => {
	animateTextWithWheelEffect();
	animateElementsWithBlur();
});
