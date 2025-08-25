import Link from "next/link"

type Items = {
    text: string,
    link?: string
}

const Breadcrumbs = ({ items }: { items: Items[] }) => {
    return <div className="breadcrumbs text-sm">
        <ul>
            {items.map((item, index) => (
                <li key={index}>
                    {item.link ? <Link href={item.link}>{item.text}</Link> : item.text}
                </li>
            ))}
        </ul>
    </div>
}

export default Breadcrumbs