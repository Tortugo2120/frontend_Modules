interface Props{
    message: string;
    type?:'info'|'warning'|'error'|'success';
    onClose?:()=>void;
}

const Alert=({message,type='info',onClose}:Props)=>{
    const alertStyles = {
        info: 'alert-info',
        success: 'alert-success',
        warning: 'alert-warning',
        error: 'alert-error',
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return(
        <div role="alert" className={`alert ${alertStyles[type]} shadow-lg mb-4`}>
            <i className={`fas ${icons[type]} text-xl`}></i>
            <span>${message}</span>
            {onClose && (
                <div className="flex-none">
                    <button onClick={onClose} className="btn btn-sm btn-ghost">Cerrar</button>
                </div>
            )}
        </div>
    );
}
export default Alert;