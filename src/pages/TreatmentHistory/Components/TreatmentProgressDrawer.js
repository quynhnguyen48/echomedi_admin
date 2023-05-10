import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import { getStrapiMedia } from "utils/media";

const TreatmentProgressDrawer = ({ openDrawer, onClose, treatmentHistory }) => {
	return (
		<Drawer open={openDrawer} onClose={onClose}>
			<DataItem
				icon="3square"
				title="Progress"
				value={`${treatmentHistory?.history?.length} / ${treatmentHistory?.progressTimes}`}
			/>
			<div className="mt-8 space-y-6">
				{Array.isArray(treatmentHistory?.history) &&
					treatmentHistory?.history.map((history) => (
						<section key={history?.id}>
							<h4 className="text-16 font-bold mt-4">{history?.title}</h4>
							{!!history?.images?.length && (
								<ul className="my-4 flex grid grid-cols-3 gap-4">
									{history?.images.map((image, index) => (
										<li className="rounded-xl overflow-hidden" key={index}>
											<img src={getStrapiMedia(image)} alt="Treatment History" />
										</li>
									))}
								</ul>
							)}
							<p>{history?.note}</p>
						</section>
					))}
			</div>
		</Drawer>
	);
};

export default TreatmentProgressDrawer;
