const Footer = () => {
	return (
		<footer className='flex text-white noicy bg-app-primary items-center justify-center '>
			<div className='flex justify-between items-center py-8 w-full max-w-6xl px-4 md:px-6 '>
				<p className='flex text-sm'>
					Built with{" "}
					<img
						className='w-5  mx-1'
						src='/icons/love.svg'
						alt=''
					/>{" "}
					for Base
				</p>
				<a
					href='https://www.base.org/name/sebastian%F0%9F%8C%9F'
					className='text-sm  text-gray-200 flex items-center font-bold md:font-normal'>
					<span className='hidden md:block'>Sebastian</span>
					<img
						src='/icons/ens-star.svg'
						alt=''
						className='md:w-3  w-[1.8rem] '
					/>
					<span className='hidden md:block'>.eth</span>
				</a>
			</div>
		</footer>
	);
};

export default Footer;
