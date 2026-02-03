const works = [
  {
    title: "Little Buddha's Academy",
    subtitle: "Primary School (Swoyamdhu, Nepal)",
    description:
      "Deeply understand advanced concepts, practice with real-world exercises, build expertise with hands-on projects to boost your career.",
    tags: ["#react.js", "#express.js", "#node.js", "#swiper.js", "#mongoDB", "#mongoose", "#css", "#javascript", "#figma"],
    image: "/images/LBA.jpg",     // put your image path
    link: "https://www.facebook.com/Baalbuddha", // redirect link
    accent: "cyan"
  },
  {
    title: "Ashirwad College",
    subtitle: "+2 College (Kapoordhara, Nepal)",
    description:
      "Being a lead developer, revamped the site to a highly responsive, and interactive website. Created new features and pages. Worked as a team with product manager and ux designer.",
    tags: ["#html", "#css", "#javascript", "#php", "#mysql"],
    image: "/images/AshirwadCollege.jpg",
    link: "https://www.facebook.com/ashirwadcollegeofficial",
    accent: "yellow"
  },

  {
    title: "Asian College Of Higher Studies",
    subtitle: "Bachelor's In Computer Application (Ekantakuna, Nepal)",
    description: "Short description...",
    tags: ["#tag1", "#tag2"],
    image: "/images/ACHS.jpg",
    link: "https://www.facebook.com/achsplustwo",
    accent: "cyan"
  },

  {
    title: "Ravensbourne University London",
    subtitle: "Master's In Computer Science (Greenwich, London)",
    description: "Short description...",
    tags: ["#tag1", "#tag2"],
    image: "/images/Ravensbourne.jpg",
    link: "https://www.ravensbourne.ac.uk/",
    accent: "yellow"
  },
];

const timelineItems = document.getElementById("timelineItems");

function makeTag(tagText) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = tagText;
  return span;
}

works.forEach((work, index) => {
  // alternate: 0 -> right content, 1 -> left content, 2 -> right...
  const side = index % 2 === 0 ? "right" : "left";

  const item = document.createElement("div");
  item.className = "timeline-item";
  item.dataset.side = side;
  item.dataset.accent = work.accent === "yellow" ? "yellow" : "cyan";

  const connector = document.createElement("span");
  connector.className = "connector";

  const node = document.createElement("span");
  node.className = "node";

  // media
  const media = document.createElement("div");
  media.className = "work-media";
  const a = document.createElement("a");
  a.href = work.link;
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  const img = document.createElement("img");
  img.src = work.image;
  img.alt = work.title;

  a.appendChild(img);
  media.appendChild(a);

  // content
  const content = document.createElement("div");
  content.className = "work-content";

  const title = document.createElement("h3");
  title.className = "work-title";
  title.textContent = work.title;

  const subtitle = document.createElement("div");
  subtitle.className = "work-subtitle";
  subtitle.textContent = work.subtitle;

  const desc = document.createElement("p");
  desc.className = "work-desc";
  desc.textContent = work.description;

  const tagsWrap = document.createElement("div");
  tagsWrap.className = "tags";
  (work.tags || []).forEach(t => tagsWrap.appendChild(makeTag(t)));

  content.appendChild(title);
  content.appendChild(subtitle);
  content.appendChild(desc);
  content.appendChild(tagsWrap);

  // append to item based on side
  item.appendChild(connector);
  if (side === "right") {
    item.appendChild(media);
    item.appendChild(node);
    item.appendChild(content);
  } else {
    item.appendChild(content);
    item.appendChild(node);
        item.appendChild(media);
    }

  timelineItems.appendChild(item);
});
