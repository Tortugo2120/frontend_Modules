type StatsCardProps = {
    title: string;
    value: string | number;
    subtitle: string;
    highlightText: string;
    bgColor: string;
}

export default function StatsCard({ title, value, subtitle, highlightText, bgColor }: StatsCardProps) {
    return (
        <div className="bg-white overflow-hidden rounded-md shadow-lg">
            <div className={`${bgColor} px-5 lg:px-6 py-4`}>
                <h3 className="text-white font-medium text-sm">{title}</h3>
            </div>
            <div className="px-5 lg:px-6 py-6 lg:py-7">
                <p className="text-3xl lg:text-4xl font-bold text-gray-800">{value}</p>
                <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                    <span className="font-medium">{highlightText}</span> {subtitle}
                </p>
            </div>
        </div>
    );
}