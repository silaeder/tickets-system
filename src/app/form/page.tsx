export default function Form() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form className=" flex flex-col">
                <h1 className=" text-4xl text-center mb-2">Заявка на проект</h1>
                <input className=" border-black border-2 mb-2 rounded-md px-1 outline-none" type="text" placeholder="ФИО"/>
                <button className="bg-blue-200 rounded-md py-2" type="submit">Отправить</button>
            </form>
        </div>
    )
}